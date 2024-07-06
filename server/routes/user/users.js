import qs from 'node:querystring';
import axios from 'axios';

import express from 'express';
import { query, body } from 'express-validator';


import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';
import jwtAuth from '#middlewares/jwtAuth.js';
import userService from '#services/user.service.js';

const router = express.Router();

// 회원 가입
router.post('/', [
  body('email').isEmail().withMessage('이메일 형식에 맞지 않습니다.'),
  body('password').trim().isLength({ min: 8 }).withMessage('8자리 이상 입력해야 합니다.'),
  body('name').trim().notEmpty().withMessage('이름은 필수로 입력해야 합니다.'),
  body('phone').optional().matches(/^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/).withMessage('휴대폰 형식에 맞지 않습니다.'),
  body('type').matches(/^(user|seller)$/).withMessage('회원 구분은 user 또는 seller로 전달해야 합니다.'),
  body('extra').optional().isObject().withMessage('extra 데이터는 객체로 전달해야 합니다.'),
], validator.checkResult, async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '회원 가입'
    #swagger.description = '회원 가입을 합니다.<br>회원 가입을 완료한 후 회원 정보를 반환합니다.'

    #swagger.requestBody = {
      description: "회원 정보가 저장된 객체입니다.<br>email: 이메일(필수)<br>password: 비밀번호(필수)<br>name: 이름(필수)<br>phone: 전화번호(선택)<br>address: 주소(선택)<br>type: 회원 구분(필수, 구매회원: user, 판매회원: seller)<br>extra: 추가 데이터(선택). 추가하고 싶은 아무 속성이나 지정",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/createUser' },
          examples: {
            "기본 속성": { $ref: "#/components/examples/createUser" },
            "extra 속성": { $ref: "#/components/examples/createUserWithExtra" }
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/createUserRes" },
            "extra 속성": { $ref: "#/components/examples/createUserResWithExtra" }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: '이메일 중복됨',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error409' }
        }
      }
    }
    #swagger.responses[422] = {
      description: '입력값 검증 오류',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error422' }
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
    const item = await userService.signup(userModel, req.body);
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 이메일 중복 체크
router.get('/email', [
  query('email').isEmail().withMessage('이메일 형식에 맞지 않습니다.'),
], validator.checkResult, async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '이메일 중복 체크'
    #swagger.description = '이메일 중복 여부를 체크 합니다.'

    #swagger.parameters['email'] = {
      description: '이메일',
      in: 'query',
      required: true,
      type: 'string',
      format: 'email',
      example: 'hello@market.com'
    }
    
    #swagger.responses[200] = {
      description: '중복되지 않음',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/simpleOK' }
        }
      }
    }
    #swagger.responses[409] = {
      description: '이메일 중복됨',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error409' }
        }
      }
    }

  */

  try{
    const userModel = req.model.user;
    const user = await userModel.findBy({ email: req.query.email });
    if(user){
      res.status(409).json({ ok: 0, message: '이미 등록된 이메일입니다.' });
    }else{
      res.status(200).json({ ok: 1 });
    }
  }catch(err){
    next(err);
  }
});

// 로그인
router.post('/login', [
  body('email').isEmail().withMessage('이메일 형식에 맞지 않습니다.'),
  body('password').trim().isLength({ min: 8 }).withMessage('8자리 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '로그인'
    #swagger.description = `이메일과 비밀번호를 입력해 로그인을 합니다.<br>
    응답 데이터에 token 속성으로 JWT 기반의 Access Token과 Refresh Token을 반환합니다.<br>
    이후 로그인이 필요한 모든 요청에는 Authorization 헤더에 Bearer 방식의 Access Token을 보내야 합니다.`

    #swagger.requestBody = {
      description: "로그인 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/login' },
        }
      }
    }

    #swagger.responses[200] = {
      description: '로그인 성공',
      content: {
        "application/json": {
          examples: {
            "이메일 로그인": { $ref: "#/components/examples/loginRes" },
            "카카오 로그인": { $ref: "#/components/examples/loginKakaoRes" }
          }
        }
      }
    }
    #swagger.responses[403] = {
      description: '로그인 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error403" }
        }
      }
    }
    #swagger.responses[422] = {
      description: '입력값 검증 오류',
      content: {
        "application/json": {
          schema: { $ref: '#/components/schemas/error422' }
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
    const user = await userService.login(userModel, req.body);
    if(user.type === 'seller' && user.extra?.confirm === false){
      res.status(403).json({ ok: 0, message: '관리자의 승인이 필요합니다.' });
    }else{
      res.json({ ok: 1, item: user });
    }
  }catch(err){
    next(err);
  }
});

// 카카오 로그인
let authcodeList = {};
router.post('/login/kakao', async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '카카오 로그인'
    #swagger.description = `
      <a href="https://developers.kakao.com/docs/latest/ko/kakaologin/common" target="_blank">카카오 개발 문서 참고</a><br>
      카카오 인가 코드 받기 API를 이용해 로그인 후 받은 인증 코드를 전달하면 카카오 회원 정보를 확인해서 자동으로 회원가입을 하거나 로그인 처리를 합니다.<br>
      카카오 로그인 API를 사용하기 위해서는 카카오에서 발급한 자바스크립트 Key나 REST API Key가 필요하므로 필요한 팀은 문의하시기 바랍니다.<br>
      응답 데이터에 token 속성으로 JWT 기반의 Access Token과 Refresh Token을 반환합니다.<br>
      추가로 kakaoToken 속성으로 카카오 로그인 API에서 받은 토큰을 반환합니다.<br>
      <br>이후 로그인이 필요한 모든 요청에는 Authorization 헤더에 Bearer 방식의 Access Token을 보내야합니다.`

    #swagger.requestBody = {
      description: `로그인 정보<br>
        code 속성에는 카카오 로그인 후에 받은 인증 코드를 지정합니다.<br>
        redirect_uri: 속성에는 카카오 인가 코드 받기 API에 사용한 redirect_uri 값을 지정합니다.<br>
        user 속성에는 카카오에서 제공하는 사용자 정보 이외에 회원 가입시 추가할 사용자 정보를 객체로 지정합니다.`,
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/kakaoLogin' },
        }
      }
    }

    #swagger.responses[200] = {
      description: '로그인 성공',
      content: {
        "application/json": {
          examples: {
            "이메일 로그인": { $ref: "#/components/examples/loginRes" },
            "카카오 로그인": { $ref: "#/components/examples/loginKakaoRes" }
          }
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
    logger.info(req.body);
    const authcode = req.body.code;
    const userData = req.body.user; // 카카오 회원정보 이외에 추가로 받은 회원 정보
    const redirect_uri = req.body.redirect_uri;

    logger.error(userData)

    // 3초 안에 동일한 authcode로 인증 요청시(리액트의 Strict 모드로 구동시 개발환경에서 두번 요청할 때 회원가입 두번 되는 문제 방지)
    if(authcodeList[authcode]){
      return res.status(200).json({ ok: 1, message: '인증 처리중 입니다.' });
    }
    authcodeList[authcode] = true;
    setTimeout(() => {
      delete authcodeList[authcode];
    }, 3000);
    /////////////////////////

    // https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token
    var getAccessTokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', qs.stringify({
      grant_type: 'authorization_code', // 고정 값
      client_id: process.env.KAKAO_RESTAPI_KEY,
      redirect_uri,
      // redirect_uri: `${process.env.APP_HOST}/users/login/kakao`,
      code: authcode,
      client_secret: process.env.KAKAO_CLIENT_SECRET,  // 카카오 내 애플리케이션 > 보안 탭에서 발급함
    }), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'}
    });
    logger.info(getAccessTokenResponse.data);

    const accessToken = getAccessTokenResponse.data.access_token;
    const refreshToken = getAccessTokenResponse.data.refresh_token;
    const expiresIn = getAccessTokenResponse.data.expires_in;

    // https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info
    var getUserInfoResponse = await axios.post('https://kapi.kakao.com/v2/user/me', {
      // property_keys: ['kakao_account.profile'] // 사용자 정보중 지정한 데이터만 응답 데이터로 전달 받을 때 사용
    }, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const kakaoUserInfo = getUserInfoResponse.data;
    delete kakaoUserInfo.properties; // deplicated된 속성이라서 불필요
    // kakaoUserInfo.refreshToken = refreshToken;

    const userModel = req.model.user;
    let user = await userService.loginKakao(userModel, kakaoUserInfo.id);
    
    if(!user){
      // 가입되지 않은 회원일 경우 자동으로 회원 가입
      const userInfo = {
        name: kakaoUserInfo.kakao_account.profile.nickname,
        profileImage: kakaoUserInfo.kakao_account.profile.thumbnail_image_url,
        type: 'user',
        kakao: kakaoUserInfo,
        ...userData
      };

      // 회원 가입
      await userService.signupKakao(userModel, userInfo);
      // 로그인
      user = await userService.loginKakao(userModel, kakaoUserInfo.id);
    }

    user.kakaoToken = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn,
    };

    res.json({
      ok: 1,
      item: user
    });

  }catch(err){
    delete err.response?.request; // 너무 많은 내용이 있어서 제거함
    logger.error(err.response || err);
    
    if(err.response?.data?.error_code){ // 카카오 API에서 보낸 에러
      res.status(err.response.status).json({ ok: 0, error: err.response?.data });
    }else{
      next(err);
    }
  }
});


// 지정한 사용자의 북마크 목록 조회
router.get('/:_id/bookmarks', async function(req, res, next) {

  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '사용자의 모든 북마크 목록 조회'
    #swagger.description = `지정한 사용자의 모든 북마크 목록(상품, 사용자, 게시글)을 조회합니다.<br>
      응답 데이터의 user 속성에 사용자에 대한 북마크 목록이,<br>
      product 속성에 상품에 대한 북마크 목록이,<br>
      post 속성에 게시글에 대한 북마크 목록이 저장되어 있습니다.`
    
    #swagger.parameters['_id'] = {
      description: "조회할 회원 id",
      in: 'path',
      type: 'number',
      example: '4'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/userBookmarkListRes" }
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
    const user_id = Number(req.params._id);
    const bookmarkModel = req.model.bookmark;
    const item = await bookmarkModel.findByUser(user_id);
    res.json({ ok: 1, item });

  }catch(err){
    next(err);
  }
});


// 회원 조회(단일 속성)
router.get('/:_id/*', jwtAuth.auth('user'), async function(req, res, next) {
  /*  
    #swagger.auto = false

    #swagger.tags = ['회원']
    #swagger.summary  = '회원 정보 조회(단일 속성)'
    #swagger.description = '회원 정보 중 한가지 속성을 조회한다.'

    #swagger.path = '/users/{_id}/{*}'
    #swagger.method = 'get'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "조회할 회원 id",
      in: 'path',
      type: 'number',
      example: '5'
    }
    #swagger.parameters['*'] = {
      description: "조회할 속성<br>단일 속성 조회 예시: name<br>중첩 속성 조회 예시: extra/addressBook",
      in: 'path',
      type: 'string',
      example: 'name'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "users/5/name 조회": { $ref: "#/components/examples/userInfoResOneAttr" },
            "users/5/extra/addressBook 조회": { $ref: "#/components/examples/userInfoResWithExtra" }
          }
        }
      }
    }
    #swagger.responses[401] = {
      description: '인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    }
    #swagger.responses[404] = {
      description: '회원이 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
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
    // if(req.user.type === 'admin' || req.params._id == req.user._id){
      logger.trace(req.params);
      const attr = req.params[0].replaceAll('/', '.');
      logger.log(attr);
      const item = await userModel.findAttrById(Number(req.params._id), attr);
      res.json({ok: 1, item});
    // }else{
    //   next(); // 404
    // }
  }catch(err){
    next(err);
  }
});

// 회원 조회(모든 속성)
router.get('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '회원 정보 조회(모든 속성)'
    #swagger.description = `회원 정보의 모든 속성을 조회합니다.<br>
      등록한 속성 이외에 다음의 정보가 추가됩니다.<br>
      posts: 지정한 사용자가 작성한 게시글 수
      postViews: 지정한 사용자가 작성한 모든 게시글 조회수
      bookmark.products: 지정한 사용자가 북마크 한 상품 수
      bookmark.users: 지정한 사용자가 북마크 한 사용자 수
      bookmark.posts: 지정한 사용자가 북마크 한 게시글 수
    `

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "조회할 회원 id",
      in: 'path',
      type: 'number',
      example: '5'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/userInfoRes" },
            "extra 속성": { $ref: "#/components/examples/userInfoResWithExtra" }
          }
        }
      }
    }
    #swagger.responses[401] = {
      description: '인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    }
    #swagger.responses[404] = {
      description: '회원이 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
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
    // if(req.user.type === 'admin' || req.params._id == req.user._id){
      const result = await userModel.findById(Number(req.params._id));
      
      if(result){
        res.json({ok: 1, item: result});
      }else{
        next();
      }      
    // }else{
    //   next(); // 404
    // }
  }catch(err){
    next(err);
  }
});


// 회원 정보 수정
router.patch('/:_id', jwtAuth.auth('user'), async function(req, res, next) {
  /*
    #swagger.tags = ['회원']
    #swagger.summary  = '회원 정보 수정'
    #swagger.description = '회원 정보를 수정한다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "회원 id",
      in: 'path',
      type: 'number',
      example: '5'
    }

    #swagger.requestBody = {
      description: "수정할 회원 정보",
      required: true,
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/updateUserOneAttr" },
            "extra 속성": { $ref: "#/components/examples/updateUserWithExtra" }
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "기본 속성": { $ref: "#/components/examples/updateUserResOneAttr" },
            "extra 속성": { $ref: "#/components/examples/updateUserResWithExtra" }
          }
        }
      }
    },
    #swagger.responses[401] = {
      description: '인증 실패',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error401" }
        }
      }
    },
    #swagger.responses[404] = {
      description: '회원이 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
        }
      }
    },
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
    logger.trace(req.body);
    const _id = Number(req.params._id);
    if(req.user.type === 'admin' || _id === req.user._id){
      if(req.user.type !== 'admin'){ // 관리자가 아니라면 회원 타입과 회원 승인 정보는 수정 못함
        delete req.body.type;
        // delete (req.body.extra && req.body.extra.confirm);
        if(req.body['extra.confirm'] === true){ // 일반 유저가 confirm 처리하지 못하도록
          delete req.body['extra.confirm'];
        }
      }
      const updated = await userService.update(userModel, _id, req.body);
      if(updated){
        res.json({ ok: 1, updated });
      }else{
        next();
      }
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

export default router;
