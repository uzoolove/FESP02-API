import createError from 'http-errors';

import logger from '#utils/logger.js';
import authService from '#services/auth.service.js';

const jwtAuth = {
  // 타입별 사용자 인증
  auth(userType){
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
              profile: payload.profile
            };
            next();
          }else{
            next(createError(403, '리소스에 접근할 권한이 없습니다.'));
          }          
        } else {
          next(createError(401, 'authorization 헤더가 없습니다.', { errorName: 'EmptyAuthorization' }));
        }
      } catch (err) {
        next(err);
      }
    };
  },
};

export default jwtAuth;

