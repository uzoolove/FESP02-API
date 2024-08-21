import moment from 'moment-timezone';

import logger from '#utils/logger.js';

class BookmarkModel {
  constructor(db, model){
    this.db = db;
    this.model = model;
  }
  
  // 북마크 등록
  async create(bookmark){
    logger.trace(arguments);
    bookmark._id = await this.db.nextSeq('bookmark');
    bookmark.createdAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    
    if(!bookmark.dryRun){
      await this.db.bookmark.insertOne(bookmark);
    }
    return bookmark;
  }

  // 북마크 목록 조회
  async findBy(query){
    logger.trace(arguments);
    const list = await this.db.bookmark.aggregate([
      { $match: query },
      {
        $lookup: {
          from: query.type, // product|post|user
          localField: `target_id`, // bookmark.target_id
          foreignField: '_id', // (product|post|user)._id
          as: query.type
        }
      }, 
      { $unwind: `$${query.type}` }, // 원본이 삭제된 경우 조회되지 않음
      // {
      //   $unwind: { // 원본이 삭제된 경우에도 원본 정보는 빈 객체로 조회됨
      //     path: `$${query.type}`,
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $project: {
          // bookmark
          _id: 1,
          memo: 1,
          extra: 1,
          createdAt: 1,

          // product, user, post 공통
          [`${query.type}._id`]: `$${query.type}._id`,
          // [`${query.type}.extra`]: `$${query.type}.extra`,
          
          // product, user
          [`${query.type}.name`]: `$${query.type}.name`,

          // product
          [`${query.type}.price`]: `$${query.type}.price`,
          [`${query.type}.quantity`]: `$${query.type}.quantity`,
          [`${query.type}.buyQuantity`]: `$${query.type}.buyQuantity`,
          [`${query.type}.mainImages`]: `$${query.type}.mainImages`,

          // user
          [`${query.type}.email`]: `$${query.type}.email`,
          [`${query.type}.image`]: `$${query.type}.image`,
          
          // post
          [`${query.type}.type`]: `$${query.type}.type`,
          [`${query.type}.title`]: `$${query.type}.title`,
          [`${query.type}.user`]: `$${query.type}.user`,
          // [`${query.type}.product_id`]: `$${query.type}.product_id`,
          
        }
      }
    ]).toArray();

    logger.debug(list);
    return list;
  }

  // 지정한 사용자의 북마크 목록 조회
  async findByUser(user_id){
    logger.trace(arguments);

    const bookmarkedList = await this.db.bookmark.aggregate([
      { $match: { type: 'user', target_id: user_id } },
      {
        $project: {
          _id: 0,
          user_id: '$user._id',
          name: '$user.name',
          email: '$user.email',
          image: '$user.image'
        }
      }
    ]).toArray();
    
    const result = { 
      byUser: bookmarkedList,
      user: await this.findBy({ type: 'user', user_id }),
      product: await this.findBy({ type: 'product', user_id }),
      post: await this.findBy({ type: 'post', user_id })
    };
    
    logger.debug(result);
    return result;
  }

  // 상품에 대한 북마크 목록 조회
  async findByProduct(product_id){
    logger.trace(arguments);
    const list = await this.db.bookmark.find({ type: 'product', target_id: product_id }).toArray();

    logger.debug(list);    
    return list;
  }

  // 지정한 검색 조건으로 북마크 한건 조회
  async findOneBy(query){
    const result = await this.findBy(query);
    logger.debug(result[0]);
    return result[0];
  }

  // 북마크 삭제
  async delete(query){
    logger.trace(arguments);
    const result = await this.db.bookmark.deleteOne(query);
    logger.debug(result);
    return result;
  }
}

export default BookmarkModel;