import createError from 'http-errors';
import { check, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

const validator = {
  // 검증 실패시 에러 처리
  checkResult(req, res, next){
    var errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
    }else{
      logger.log(errors.array());
      let msg = errors.array().map(error => `${error.msg}(${error.param}: ${error.value})`).join('\n');
      let customMsg = errors.array().map(error => `${error.msg}(${error.param})`).join('<br>');
      logger.debug(msg, customMsg);
      next(createError(422, '잘못된 입력값이 있습니다.', { errors: errors.array() }));
    }
  }
};

export default validator;