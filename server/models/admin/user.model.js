import _ from 'lodash';

import logger from '#utils/logger.js';


class AdminUserModel{
  constructor(db, model){
    this.db = db;
    this.model = model;
  }
  
  // 회원 목록 조회
  async find({ search={}, sortBy={}, page=1, limit=0 }){
    logger.trace(arguments);
    const query = { ...search };

    const skip = (page-1) * limit;
    logger.debug(query);

    const totalCount = await this.db.user.countDocuments(query);
    const list = await this.db.user.find(query).project({
      password: 0,
      refreshToken: 0,
    }).skip(skip).limit(limit).sort(sortBy).toArray();
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
};
  

export default AdminUserModel;