import moment from 'moment-timezone';

import logger from '#utils/logger.js';

class NotificationModel {
  constructor(db, model){
    this.db = db;
    this.model = model;
  }
  
  // 알림 등록
  async create(notification){
    logger.trace(notification);

    notification._id = await this.db.nextSeq('notification');
    notification.channel = notification.channel || 'none'; // none, websocket, email, sms, slack, discode ...
    notification.isRead = false;
    notification.updatedAt = notification.createdAt = moment().tz('Asia/Seoul').format('YYYY.MM.DD HH:mm:ss');
    if(!notification.dryRun){
      await this.db.notification.insertOne(notification);
    }
    return notification;
  }

  // 읽지 않은 알림 목록 조회
  async find({ userId, search={}, sortBy={}, page=1, limit=0, setRead=false }){
    logger.trace(arguments);
    
    let query = { isRead: false, ...search, target_id: userId };
    
    logger.trace(query);

    const skip = (page-1) * limit;

    const totalCount = await this.db.notification.countDocuments(query);
    const list = await this.db.notification.find(query).skip(skip).limit(limit).sort(sortBy).toArray();

    if(setRead){ // 조회된 문서에 대해서 읽음 처리
      const updateResult = await this.db.notification.updateMany({ _id: { $in: list.map(doc => doc._id) }}, { $set: { isRead: true } });
      logger.debug(updateResult);
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

  // 읽지 않은 알림 수 조회
  async getCount(userId){
    logger.trace(arguments);      
    let query = { isRead: false, target_id: userId };      

    const totalCount = await this.db.notification.countDocuments(query);

    logger.debug('읽지 않은 알림 수', totalCount);
    return totalCount;
  }

}

export default NotificationModel;