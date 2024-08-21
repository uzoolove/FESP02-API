import createError from 'http-errors';

import logger from '#utils/logger.js';
import authService from '#services/auth.service.js';

const jwtAuth = {
  /**
   * 타입별 사용자 인증
   * @param {*} userType 
   * @param {*} optional 로그인이 필수가 아닐 경우 true로 전달 
   * @returns 
   */
  auth(userType, optional){
    return async function(req, res, next){
      try {
        const token = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
        if (token) {
          const payload = authService.verifyToken(token);
          logger.log('payload', payload);
          if(payload.type === 'admin' || (payload.type === 'seller' && userType === 'user') || (payload.type === userType)){
            req.user = {
              _id: payload._id,
              type: payload.type,
              name: payload.name,
              email: payload.email,
              image: payload.image
            };
          }else{
            if(!optional) return next(createError(403, '리소스에 접근할 권한이 없습니다.'));
          }
        } else {
          if(!optional) return next(createError(401, 'authorization 헤더가 없습니다.', { errorName: 'EmptyAuthorization' }));
        }
        next();
      } catch (err) {
        if(optional && err.name === 'UnauthorizedError'){
          next();
        }else{
          next(err);
        }
      }
    };
  },
};

export default jwtAuth;

