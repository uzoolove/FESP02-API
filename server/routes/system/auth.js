import express from 'express';
import authService from '#services/auth.service.js';

const router = express.Router();

// Access Token 재발행
router.get('/refresh', async (req, res, next) => {
  /*
    #swagger.tags = ['인증']
    #swagger.summary  = 'Access 토큰 재발행'
    #swagger.description = 'Authorization 헤더에 Bearer 방식의 Refresh Token을 보내서 Access Token을 재발급 합니다.'

    #swagger.security = [{
      "Refresh Token": []
    }]

    #swagger.parameters['authorization'] = {
      description: "Refresh Token<br>화면 우측 상단의 자물쇠 버튼을 눌러 refreshToken을 먼저 등록하세요.<br>refreshToken은 로그인 후 발급 받을 수 있습니다.",
      in: 'header',
      example: '비워두세요'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/accessTokenRes" }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Refresh Token 인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    }
    #swagger.responses[500] = {
      description: '서버 에러',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error500' }
        }
      }
    }
  */

  try{
    const userModel = req.model.user;
    const refreshToken = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
    const accessToken = await authService.refresh(userModel, refreshToken);
  
    res.json({ ok: 1, accessToken });
  }catch(err){
    next(err);
  }
});

export default router;
