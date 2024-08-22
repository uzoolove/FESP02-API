import express from 'express';
import { query, body } from 'express-validator';
import moment from 'moment';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 상품 구매
router.post('/', [
  body('products').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
  body('products.*._id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('products.*.quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = true

    #swagger.tags = ['구매']
    #swagger.summary  = '상품 구매'
    #swagger.description = '상품을 구매합니다.'

    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.requestBody = {
      description: "구매 정보가 저장된 객체입니다.<br>products 속성은 필수이며 객체 배열입니다.<br>배열의 요소인 객체는 다음과 같은 필수 정보를 포함해야 하고 추가 속성은 자유롭게 지정하면 됩니다.<br>_id: 상품 id<br>quantity: 구매 수량",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/orderCreate' },
          examples: {
            "필수 속성만 지정한 경우": { $ref: "#/components/examples/createOrder" },
            "추가 속성이 지정된 경우": { $ref: "#/components/examples/createOrderWithExtra" }
          }
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderCreateRes" },
          examples: {
            "필수 속성만 지정한 경우": { $ref: "#/components/examples/createOrderRes" },
            "추가 속성이 지정된 경우": { $ref: "#/components/examples/createOrderWithExtraRes" }
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
    const orderModel = req.model.order;
    req.body.state = req.body.state || 'OS020'; // 결제 완료 상태로 주문
    const item = await orderModel.create({ ...req.body, user_id: req.user._id });
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 구매 목록 조회
router.get('/', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['구매']
    #swagger.summary  = '구매 목록 조회'
    #swagger.description = '자신의 구매 목록을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['keyword'] = {
      description: "상품명 검색어",
      in: 'query',
      type: 'string',
      example: '레고'
    }

    #swagger.parameters['custom'] = {
      description: "custom 검색 조건",
      in: 'query',
      type: 'string',
      example: '{\"cost.total\":{\"$gte\":40000}}'
    }
    #swagger.parameters['page'] = {
      description: "페이지",
      in: 'query',
      type: 'number',
      example: 2
    }
    #swagger.parameters['limit'] = {
      description: "한 페이지당 항목 수",
      in: 'query',
      type: 'number',
      example: 10
    }
    #swagger.parameters['sort'] = {
      description: "정렬(내림차순: -1, 오름차순: 1)",
      in: 'query',
      type: 'string',
      example: '{\"cost.total\": -1}',
      default: '{\"_id\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderListRes" }
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
  const orderModel = req.model.order;
  logger.trace(req.query);

  // 검색 옵션
  let search = {};
  const keyword = req.query.keyword;
  const custom = req.query.custom;

  if(keyword){
    const regex = new RegExp(keyword, 'i');
    search['products'] = { $elemMatch: { name: { '$regex': regex } } };
  }
  
  if(custom){
    search = { ...search, ...JSON.parse(custom) };
  }

  // 정렬 옵션
  let sortBy = JSON.parse(req.query.sort || '{}');

  // 기본 정렬 옵션은 등록일의 내림차순
  sortBy['_id'] = sortBy['_id'] || -1; // 내림차순

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 0);

  const result = await orderModel.findBy({ user_id: req.user._id, search, sortBy, page, limit });
  
  res.json({ ok: 1, ...result });
}catch(err){
  next(err);
}
});

// 구매 목록의 상태값만 조회
router.get('/state', async function(req, res, next) {

  /*

    #swagger.tags = ['구매']
    #swagger.summary  = '구매 목록의 상태값 조회'
    #swagger.description = '구매 목록의 상태값을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderStateRes" }
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
    const orderModel = req.model.order;
    const item = await orderModel.findState(req.user._id);
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 구매 상세 조회
router.get('/:_id', async function(req, res, next) {

  /*

    #swagger.tags = ['구매']
    #swagger.summary  = '구매 상세 조회'
    #swagger.description = '구매 상세 내역을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "구매 id",
      in: 'path',
      type: 'number',
      example: 4
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderInfoRes" }
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
      description: '본인의 구매 id가 아니거나 존재하지 않는 구매 id',
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
    const orderModel = req.model.order;
    const item = await orderModel.findById(Number(req.params._id), req.user._id);
    if(item){
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 주문별 주문 상태 수정
router.patch('/:_id', async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['구매']
    #swagger.summary  = '주문별 주문 상태 수정'
    #swagger.description = '주문별로 주문 상태를 수정합니다.(반품 요청, 환불 요청 등)<br>하나의 주문에 하나의 상품만 있을 경우 주문별로 주문 상태를 관리하고 싶을 때 사용합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "구매 id",
      in: 'path',
      type: 'number',
      example: 2
    }

    #swagger.requestBody = {
      description: "주문 상태 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/updateOrder' }
        }
      }
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderRes" }
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
      description: '본인의 구매 id가 아니거나 존재하지 않는 구매 id',
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
    const orderModel = req.model.order;
    logger.trace(req.query);
    const _id = Number(req.params._id);
    const order = await orderModel.findById(_id);
    if(req.user.type === 'admin' || req.user._id === order.user_id){
      const history = {
        actor: req.user._id,
        updated: { ...req.body },
        createdAt: moment().format('YYYY.MM.DD HH:mm:ss')
      };
      const result = await orderModel.updateState(_id, req.body, history);
      res.json({ok: 1, item: result});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 상품별 주문 상태 수정
router.patch('/:_id/products/:product_id', async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['구매']
    #swagger.summary  = '상품별 주문 상태 수정'
    #swagger.description = '상품별로 주문 상태를 수정합니다.(반품 요청, 환불 요청 등)<br>여러 판매자의 상품을 한번에 주문하고 결제했을 경우 하나의 주문에 여러 상품이 있고 각 상품별로 주문 상태를 관리하고 싶을 때 사용합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "구매 id",
      in: 'path',
      type: 'number',
      example: 2
    }

    #swagger.parameters['product_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 3
    }

    #swagger.requestBody = {
      description: "주문 상태 정보",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/updateOrderProduct' }
        }
      }
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderProductRes" }
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
      description: '본인의 구매 id가 아니거나 존재하지 않는 구매 id',
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
    const orderModel = req.model.order;
    logger.trace(req.query);
    const _id = Number(req.params._id);
    const product_id = Number(req.params.product_id);
    const order = await orderModel.findById(_id);
    if(req.user.type === 'admin' || req.user._id === order.user_id){
      const history = {
        actor: req.user._id,
        updated: { ...req.body },
        createdAt: moment().format('YYYY.MM.DD HH:mm:ss')
      };
      const result = await orderModel.updateStateByProduct(_id, product_id, req.body, history);
      res.json({ok: 1, item: result});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

export default router;
