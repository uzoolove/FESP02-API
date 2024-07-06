import _ from 'lodash';
import moment from 'moment-timezone';

import logger from '#utils/logger.js';

class PostModel{
  constructor(db, model){
    this.db = db;
    this.model = model;
  }

  // 게시글 등록
  async create(post){
    post.type = post.type || 'post';
    logger.trace(post);
    post._id = await this.db.nextSeq('post');
    post.updatedAt = post.createdAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    post.seller_id = (await this.model.sellerProduct.findAttrById({ _id: post.product_id, attr: 'seller_id' }))?.seller_id
    if(!post.dryRun){
      await this.db.post.insertOne(post);
    }
    return post;
  }

  // 게시글 목록 조회
  async find({ type='post', search={}, sortBy={}, page=1, limit=0 }){
    logger.trace(arguments);
    const query = { type, ...search };
    logger.trace(query);

    const skip = (page-1) * limit;

    const totalCount = await this.db.post.countDocuments(query);
    // const list = await this.db.post.find(query).sort(sortBy).toArray();

    let list = this.db.post.aggregate([
      { $match: query },
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
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          type: 1,
          product_id: 1,
          seller_id: 1,
          user: 1,
          title: 1,
          content: 1,
          image: 1,
          extra: 1,
          createdAt: 1,
          updatedAt: 1,
          views: 1,
          tag: 1,
          repliesCount: { $cond: { if: { $isArray: '$replies' }, then: { $size: '$replies' }, else: 0 } },
          'product.name': '$product.name',
          // 'product.image': { $cond: { if: { $isArray: '$product.mainImages' }, then: { $arrayElemAt: ['$product.mainImages', 0] }, else: undefined } }
          'product.image': { $arrayElemAt: ['$product.mainImages', 0] }
        }
      }
    ]).sort(sortBy).skip(skip);

    // aggregate()에서는 limit(0) 안됨
    if(limit > 0){
      list = list.limit(limit);
    }
    list = await list.toArray();

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

  // 게시글 상세 조회
  async findById(_id, justView){
    logger.trace(arguments);
    
    let item;
    if(justView){ // 처음 조회때만 조회수 증가(댓글 목록 조회를 위해 호출될 경우 조회수 증가 방지)
      item = await this.db.post.findOne({ _id });
    }else{
      item = await this.db.post.findOneAndUpdate(
        { _id },
        { $inc: { views: 1 } },
        { returnDocument: 'after' } // 업데이트된 문서 반환
      );
    }
    
    logger.debug(item);
    return item;
  }

  // 게시글 수정
  async update(_id, post){
    logger.trace(arguments);
    post.updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    if(!post.dryRun){
      await this.db.post.updateOne(
        { _id },
        { 
          $set: {
            title: post.title,
            content: post.content,
            extra: post.extra,
            updatedAt: post.updatedAt
          }
        }
      );
    }
    return { _id, ...post };
  }

  // 게시글 삭제
  async delete(_id){
    logger.trace(arguments);

    const result = await this.db.post.deleteOne({ _id });
    logger.debug(result);
    return result;
  }

  // 댓글 목록 조회
  async findReplies({ _id, page=1, limit=0, sortBy }){
    logger.trace(arguments);
    
    const post = await this.findById(_id, true);

    let list = post.replies || [];
    const totalCount = list.length;

    const sortKeys = [];
    const orders = [];
    for(const key in sortBy){
      sortKeys.push(key);
      orders.push(sortBy[key] === 1 ? 'asc' : 'desc');
    }

    list = _.orderBy(list, sortKeys, orders);

    const skip = (page-1) * limit;
    if(limit > 0){
      list = list.splice(skip, limit);
    }else{
      list = list.splice(skip);
    }    
    
    const result = { item: list };
    result.pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: (limit === 0) ? 1 : Math.ceil(totalCount / limit)
    };

    logger.debug(result);
    return result;
  }

  // 댓글 등록
  async createReply(_id, reply){
    logger.trace(arguments);
    reply._id = await this.db.nextSeq('reply');
    reply.updatedAt = reply.createdAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    if(!reply.dryRun){
      await this.db.post.updateOne({ _id }, { $push: { replies: reply } });
    }
    return reply;
  }

  // 댓글 수정
  async updateReply(_id, reply_id, reply){
    logger.trace(arguments);
    reply.updatedAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');

    const setData = {};
    for(let prop in reply){
      setData[`replies.$[elementKey].${prop}`] = reply[prop];
    }
    const result = await this.db.post.findOneAndUpdate(
      { _id },
      { 
        $set: setData
      },
      // { 
      //   $set: { 
      //     'replies.$[elementKey].comment': reply.comment,
      //     'replies.$[elementKey].updatedAt': reply.updatedAt
      //   } 
      // },
      { 
        arrayFilters: [{ 'elementKey._id': reply_id }],
        returnDocument: 'after' // 업데이트된 문서 반환
      }
    );
    const updatedReply = result.replies.find(reply => reply._id === reply_id);
    logger.debug(updatedReply);
    return updatedReply;
  }

  // 댓글 삭제
  async deleteReply(_id, reply_id){
    logger.trace(arguments);

    const result = await this.db.post.updateOne(
      { _id },
      { $pull: { replies: { _id: reply_id }} }
    );
    logger.debug(result);
    return result;
  }
}

export default PostModel;
