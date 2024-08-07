import _ from 'lodash';
import moment from 'moment-timezone';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import priceUtil from '#utils/priceUtil.js';

class OrderModel {
  constructor(clientId, db, model){
    this.clientId = clientId;
    this.db = db;
    this.model = model;
  }
  
  // 주문 등록
  async create(orderInfo){
    logger.trace(arguments);
    orderInfo._id = await this.db.nextSeq('order');
    orderInfo.updatedAt = orderInfo.createdAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const products = [];

    for(let {_id, quantity} of orderInfo.products){
      const product = await this.model.product.findById({ _id });
      if(product){
        if(product.quantity-product.buyQuantity >= quantity){
          // 상품의 구매된 수량 수정
          if(!orderInfo.dryRun){
            this.db.product.updateOne({ _id }, { $set: { buyQuantity: product.buyQuantity+quantity } });
          }
          products.push({
            _id,
            quantity,
            seller_id: product.seller_id,
            name: product.name,
            image: product.mainImages?.length && product.mainImages[0],
            price: product.price * quantity,
            extra: product.extra
          });
        }else{
          throw createError(422, `[${product._id} ${product.name}] 상품의 구매 가능한 수량은 ${product.quantity-product.buyQuantity}개 입니다.`);
        }
      }else{
        throw createError(422, `상품번호 ${_id}인 상품이 존재하지 않습니다.`);
      }
    }

    orderInfo.products = products;
    const userModel = this.model.user;
    const cost = await priceUtil.getCost(this.clientId, this.db, userModel, { products: orderInfo.products, clientDiscount: orderInfo.discount, user_id: orderInfo.user_id });
    delete orderInfo.discount;
    orderInfo = { ...orderInfo, cost };

    if(!orderInfo.dryRun){
      await this.db.order.insertOne(orderInfo);
    }
    
    // 장바구니 상품 구매시 구매한 상품은 장바구니 목록에서 제거
    if(orderInfo.type == 'cart'){
      const cartList = await this.model.cart.findByUser(orderInfo.user_id);
      const deleteIdList = _.chain(cartList)
        .filter(cart => _.find(orderInfo.products, { '_id': cart.product_id }))
        .map('_id')
        .value();
      if(!orderInfo.dryRun){
        await this.model.cart.deleteMany(deleteIdList);
      }
    }
    return orderInfo;
  }

  // 주문 목록 검색
  async findBy({ user_id, search, sortBy, page=1, limit=0 }){
    logger.trace(arguments);
    const query = { user_id, ...search };
    logger.log(query);

    const skip = (page-1) * limit;

    const totalCount = await this.db.order.countDocuments(query);
    const list = await this.db.order.find(query).skip(skip).limit(limit).sort(sortBy).toArray();

    for(const order of list){
      for(const product of order.products){
        const reply = await this.model.reply.findById(product.reply_id);
        if(reply){
          delete reply._id;
          delete reply.user_id;
          delete reply.order_id;
          delete reply.product_id;
          product.reply = reply;
        }
      }
    }

    const result = { item: list };

    result.pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: (limit === 0) ? 1 : Math.ceil(totalCount / limit)
    };

    logger.debug(list.length);
    return result;
  }

  // 구매 목록의 상태값만 조회
  async findState(user_id){
    logger.trace(arguments);

    // const list = await this.db.order.find({ user_id }).toArray();

    const list = await this.db.order.aggregate([
      { $match: { user_id } },
      { $unwind: '$products' },
      {
        $project: {
          _id: 0,
          state: 1,
          // 'products._id': 1,
          'products.state': 1,
          // state: '$products.state',
        }
      }
    ]).toArray();


    logger.debug(list);
    return list;
  }


  // 주문 내역 상세 조회
  async findById(_id, user_id){
    logger.trace(arguments);
    const query = { _id };
    if(user_id){
      query['user_id'] = user_id;
    }
    const item = await this.db.order.findOne(query);
    logger.debug(item);
    return item;
  }

  // 주문 내역에 후기 추가
  async updateReplyId(_id, product_id, reply_id){
    logger.trace(arguments);
    const result = await this.db.order.updateOne(
      {
        _id,
        products: {
          $elemMatch: {
            _id: product_id
          }
        }
      },
      { 
        $set: { ['products.0.reply_id']: reply_id }
      }
    );
    logger.debug(result);
    return result;
  }

  // 주문별 주문 상태 수정
  async updateState(_id, order, history){
    logger.trace(arguments);

    order.updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const set = { state: order.state };
    if(order.delivery){
      set['delivery'] = order.delivery;
    }

    logger.log(set);

    const result = await this.db.order.updateOne(
      { _id }, 
      { $set: set, $push: { history } }
    );

    logger.debug(result);
    const item = { _id, ...order };
    return item;
  }

  // 상품별 주문 상태 수정
  async updateStateByProduct(_id, product_id, order, history){
    logger.trace(arguments);

    order.updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const set = { 'products.$[elem].state': order.state };
    if(order.delivery){
      set['products.$[elem].delivery'] = order.delivery;
    }

    logger.log(set);

    const result = await this.db.order.updateOne(
      { _id }, 
      { $set: set, $push: { 'products.$[elem].history': history } }, 
      { arrayFilters: [{ 'elem._id': product_id }] }
    );

    logger.debug(result);
    const item = { _id, product_id, ...order };
    return item;
  }

};

export default OrderModel;