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
          localField: `target_id`,
          foreignField: '_id',
          as: query.type
        }
      }, 
      { $unwind: `$${query.type}` }, 
      {
        $project: {
          _id: 1,
          user_id: 1,
          // target_id: 1,
          memo: 1,
          [`${query.type}._id`]: `$${query.type}._id`,
          [`${query.type}.name`]: `$${query.type}.name`,
          [`${query.type}.price`]: `$${query.type}.price`,
          [`${query.type}.quantity`]: `$${query.type}.quantity`,
          [`${query.type}.buyQuantity`]: `$${query.type}.buyQuantity`,
          [`${query.type}.image`]: { $arrayElemAt: [`$${query.type}.mainImages`, 0] },
          [`${query.type}.type`]: `$${query.type}.type`,
          [`${query.type}.user`]: `$${query.type}.user`,
          [`${query.type}.product_id`]: `$${query.type}.product_id`,
          [`${query.type}.title`]: `$${query.type}.title`,
          [`${query.type}.extra`]: `$${query.type}.extra`,
          createdAt: 1
        }
      }
    ]).toArray();

    logger.debug(list);
    return list;
  }

  // 사용자의 북마크 목록 조회
  async findByUser(user_id){
    logger.trace(arguments);
    const list = await this.db.bookmark.aggregate([
      { $match: { user_id } },
      {
        $group: {
          _id: "$type",
          bookmarks: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          bookmarks: 1
        }
      }
    ]).toArray();
    
    const finalResult = {};
    list.forEach(item => {
      finalResult[item.type] = item.bookmarks;
    });
    
    logger.debug(finalResult);
    return finalResult;
  }



  // 북마크 목록 조회
  async findByProduct(product_id){
    logger.trace(arguments);
    const list = await this.db.bookmark.find({ type: 'product', target_id: product_id }).toArray();

    logger.debug(list);    
    return list;
  }

  // 지정한 검색 조건으로 북마크 한건 조회
  async findOneBy(query){
    logger.trace(arguments);
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