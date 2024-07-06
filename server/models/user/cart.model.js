import _ from 'lodash';
import moment from 'moment-timezone';
import createError from 'http-errors';

import logger from '#utils/logger.js';
import priceUtil from '#utils/priceUtil.js';

class CartModel {
  constructor(clientId, db, model){
    this.clientId = clientId;
    this.db = db;
    this.model = model;
  }
  
  // 장바구니 등록
  async create(cartInfo){
    logger.trace(arguments);
    const updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const beforeCart = await this.findByUser(cartInfo.user_id);
    const sameProduct = _.find(beforeCart, { product_id: cartInfo.product_id });
    
    // 이미 등록된 상품일 경우 수량을 증가시킨다.
    if(sameProduct){
      const quantity = sameProduct.quantity + cartInfo.quantity;
      if(!cartInfo.dryRun){
        await this.db.cart.updateOne({ _id: sameProduct._id }, { $set: { quantity, updatedAt } });
      }
    }else{
      cartInfo._id = await this.db.nextSeq('cart');
      cartInfo.updatedAt = cartInfo.createdAt = updatedAt;
      const product = await this.db.product.findOne({ _id: cartInfo.product_id }, { name: 1, price: 1, mainImages: 1});
      product.image = product.mainImages[0];
      cartInfo.product = product;
      if(!cartInfo.dryRun){
        await this.db.cart.insertOne(cartInfo);
      }
    }
    const list = await this.findByUser(cartInfo.user_id);
    return list;
  }

  // 장바구니 목록 조회(비로그인 상태))
  async findLocalCart({ products, discount }){
    logger.trace(arguments);
    const carts = {
      products: [],
      cost: {}
    };
    for(let { _id, quantity } of products){
      const product = await this.model.product.findById({ _id });
      if(product){
        carts.products.push({
          _id,
          quantity,
          quantityInStock: product.quantity - product.buyQuantity,
          seller_id: product.seller_id,
          name: product.name,
          image: product.mainImages[0],
          price: product.price * quantity,
          extra: product.extra
        });
      }else{
        throw createError(422, `상품번호 ${_id}인 상품이 존재하지 않습니다.`);
      }
    }

    const userModel = this.model.user;
    carts.cost = await priceUtil.getCost(this.clientId, this.db, userModel, { products, clientDiscount: discount });

    logger.debug(carts);
    return carts;
  }

  // 장바구니 목록 조회(로그인 상태)
  async findByUser(user_id, discount){
    logger.trace(arguments);
    // const list = await this.db.cart.find({ user_id }).sort({ createdAt: -1 }).toArray();

    const list = await this.db.cart.aggregate([
      { $match: { user_id } },
      {
        $lookup: {
          from: 'product',
          localField: 'product_id',
          foreignField: '_id',
          as: 'product'
        }
      }, 
      { 
        $unwind: {
          path: '$product'
        }
       }, 
      {
        $project: {
          _id: 1,
          product_id: 1,
          quantity: 1,
          createdAt: 1,
          updatedAt: 1,
          'product._id': '$product._id',
          'product.name': '$product.name',
          'product.price': '$product.price',
          'product.seller_id': '$product.seller_id',
          'product.quantity': '$product.quantity',
          'product.buyQuantity': '$product.buyQuantity',
          'product.image': { $arrayElemAt: ['$product.mainImages', 0] },
          'product.extra': '$product.extra',
        }
      }
    ]).sort({ _id: -1 }).toArray();

    const userModel = this.model.user;
    list.cost = await priceUtil.getCost(this.clientId, this.db, userModel, { products: _.map(list, cart => ({ _id: cart.product._id, quantity: cart.quantity })), clientDiscount: discount, user_id });

    logger.debug(list);
    return list;
  }

  async findById(_id){
    logger.trace(arguments);
    const item = await this.db.cart.findOne({ _id });
    logger.debug(item);
    return item;
  }

  // 장바구니 상품 수량 수정
  async update(_id, quantity){
    logger.trace(arguments);

    const updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const result = await this.db.cart.updateOne({ _id }, { $set: { quantity, updatedAt } });
    logger.debug(result);
    const item = { _id, quantity, updatedAt };
    return item;
  }

  // 장바구니 상품 한건 삭제
  async delete(_id){
    logger.trace(arguments);

    const result = await this.db.cart.deleteOne({ _id });
    logger.debug(result);
    return result;
  }

  // 장바구니 상품 여러건 삭제
  async deleteMany(cartIdList){
    logger.trace(arguments);

    const result = await this.db.cart.deleteMany({ _id: { $in: cartIdList } });
    logger.debug(result);
    return result;
  }

  // 장바구니 비우기
  async cleanup(user_id){
    logger.trace(arguments);

    const result = await this.db.cart.deleteMany({ user_id });
    logger.debug(result);
    return result;
  }

  // 장바구니 상품 합치기
  async add(user_id, products){
    logger.trace(arguments);

    const updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    const beforeCart = await this.findByUser(user_id);

    for(const product of products){
      const sameProduct = _.find(beforeCart, { product_id: product._id });
    
      // 이미 등록된 상품일 경우 수량을 증가시킨다.
      if(sameProduct){
        const quantity = sameProduct.quantity + product.quantity;
        if(!products.dryRun){
          await this.db.cart.updateOne({ _id: sameProduct._id }, { $set: { quantity, updatedAt } });
        }
      }else{
        const dbProduct = await this.db.product.findOne({ _id: product._id }, { projection: { _id: 0, name: 1, price: 1, mainImages: 1}});
        dbProduct.image = dbProduct.mainImages[0];
        delete dbProduct.mainImages;
        logger.debug();
        const cart = {
          _id: await this.db.nextSeq('cart'),
          user_id,
          product_id: product._id,
          quantity: product.quantity,
          product: dbProduct
        };
        cart.updatedAt = cart.createdAt = updatedAt;
        logger.debug(cart);
        if(!products.dryRun){
          await this.db.cart.insertOne(cart);
        }
      }
    }
    
    const list = await this.findByUser(user_id);
    return list;
  }
};

export default CartModel;