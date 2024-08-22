import express from 'express';
import { query, body } from 'express-validator';

import logger from '#utils/logger.js';
import jwtAuth from '#middlewares/jwtAuth.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 구매 후기 등록
router.post('/', jwtAuth.auth('user'), [
  body('order_id').isInt().withMessage('구매 id는 정수만 입력 가능합니다.'),
  body('product_id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('rating').optional().isInt().withMessage('후기 점수는 정수만 입력 가능합니다.'),
  body('content').trim().isLength({ min: 2 }).withMessage('2글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '구매 후기 등록'
    #swagger.description = '구매 후기를 등록합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: "구매 후기가 저장된 객체입니다.<br>order_id: 구매 id(필수, 정수)<br>product_id: 상품 id(필수, 정수)<br>rating: 점수(선택, 정수)<br>content: 내용(필수)<br>extra: 추가 정보(선택, 객체로 자유롭게 지정)",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/orderReplyCreate' },
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderReplyCreateRes" },
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
    const replyModel = req.model.reply;

    const reply = req.body;
    reply.user_id = req.user._id;
    reply.user = {
      _id: req.user._id,
      name: req.user.name,
      image: req.user.image
    };
    const item = await replyModel.create(reply);
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 지정한 상품의 후기 목록 조회
router.get('/products/:_id', [
  query('rating').optional().isInt().withMessage('후기 점수는 정수만 입력 가능합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '상품 구매 후기 목록'
    #swagger.description = '지정한 상품의 구매 후기 목록을 조회합니다.'
     
    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 3
    }
    #swagger.parameters['rating'] = {
      description: "후기 점수",
      in: 'query',
      type: 'number',
      example: 5
    }
    #swagger.parameters['sort'] = {
      description: "정렬(내림차순: -1, 오름차순: 1)",
      in: 'query',
      type: 'string',
      example: '{\"replies\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/replyListRes" }
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
    const replyModel = req.model.reply;
    let search = {
      product_id: Number(req.params._id)
    };
    const rating = Number(req.query.rating);

    if(rating){
      search.rating = rating;
    }


    // 정렬 옵션
    let sortBy = JSON.parse(req.query.sort || '{}');

    // 기본 정렬 옵션은 _id의 내림차순
    sortBy['_id'] = sortBy['_id'] || -1; // 내림차순

    const item = await replyModel.findBy(search, sortBy);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 모든 후기 목록 조회
router.get('/all', async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '구매 후기 목록'
    #swagger.description = '모든 사용자의 구매 후기 목록을 조회합니다.'
    
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/replyListRes" }
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
    const replyModel = req.model.reply;
    const item = await replyModel.findBy();
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 후기 상세 조회
router.get('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '구매 후기 상세'
    #swagger.description = '구매 후기를 상세 조회합니다.'
    
    #swagger.parameters['_id'] = {
      description: "후기 id",
      in: 'path',
      type: 'number',
      example: 3
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/replyInfoRes" }
        }
      }
    }
    #swagger.responses[404] = {
      description: '리소스가 존재하지 않음',
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
    const replyModel = req.model.reply;
    const item = await replyModel.findBy({ _id: Number(req.params._id) });
    if(item){
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 내 후기 목록 조회
router.get('/', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '내 구매 후기 목록'
    #swagger.description = '내가 등록한 모든 구매 후기 목록을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/replyListRes" }
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
    const replyModel = req.model.reply;
    const item = await replyModel.findBy( { user_id: req.user._id });
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 판매자 후기 목록 조회
router.get('/seller/:seller_id', async function(req, res, next) {

  /*
    #swagger.tags = ['구매 후기']
    #swagger.summary  = '판매자 구매 후기 목록'
    #swagger.description = '판매자의 상품별로 등록된 모든 구매 후기 목록을 조회합니다.'
    
    #swagger.parameters['seller_id'] = {
      description: "판매자 id",
      in: 'path',
      type: 'number',
      example: 2
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/sellerReplyListRes" }
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
    const replyModel = req.model.reply;
    const seller_id = Number(req.params.seller_id);
    const item = await replyModel.findBySeller(seller_id);
    res.json({ok: 1, item});
  }catch(err){
    next(err);
  }
});



export default router;
