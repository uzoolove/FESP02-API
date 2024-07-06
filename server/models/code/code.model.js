import _ from 'lodash';
import createError from 'http-errors';

import logger from '#utils/logger.js';

class CodeModel {
  constructor(db, model){
    this.db = db;
    this.model = model;
  }
  
  // 코드 등록
  async create(codeInfo){
    logger.trace(arguments);

    try{
      if(!codeInfo.dryRun){
        await this.db.code.insertOne(codeInfo);
        return codeInfo;
      }
    }catch(err){
      logger.error(err);
      if(err.code === 11000){
        throw createError(409, '이미 등록된 코드입니다.', { cause: err });
      }else{
        throw err;
      }
    }
  }

  // 코드 목록 조회
  async find(){
    logger.trace(arguments);
    const sortBy = {
      sort: 1
    };
    const list = await this.db.code.find().sort(sortBy).toArray();
    logger.debug(list.length, list);
    return list;
  }

  // 코드 상세 조회
  async findById(_id, search){
    logger.trace(arguments);
    let item = await this.db.code.findOne({ _id });
    if(item){
      // 검색 속성이 문자열일 경우 숫자로 변환
      // 숫자로 변환할 수 없는 문자열은 그대로 사용
      search = Object.keys(search).reduce((acc, key) => ({ ...acc, [key]: isNaN(Number(search[key])) ? search[key] : Number(search[key]) }), {});
      item.codes = _.chain(item.codes).filter(search).sortBy(['sort']).value();
    }
    
    logger.debug(item);
    return item;
  }

  // 코드 수정
  async update(_id, code){
    logger.trace(arguments);
    const result = await this.db.code.updateOne({ _id }, { $set: code });
    logger.debug(result);
    const item = { _id, ...code };
    return item;
  }

  // 코드 삭제
  async delete(_id){
    logger.trace(arguments);
    const result = await this.db.code.deleteOne({ _id });
    logger.debug(result);
    return result;
  }
};

export default CodeModel;