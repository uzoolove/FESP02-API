import _ from 'lodash';
import moment from 'moment';
import express from 'express';
import { param, query, body } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 상품의 주문 내역 조회
router.get('/', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['주문 관리']
    #swagger.summary  = '주문 목록 조회'
    #swagger.description = '나에게 주문한 내역을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['user_id'] = {
      description: "주문한 회원 id",
      in: 'query',
      type: 'number',
      example: 4
    }
    #swagger.parameters['state'] = {
      description: "주문 상태",
      in: 'query',
      type: 'string',
      example: 'OS020'
    }
    #swagger.parameters['custom'] = {
      description: "custom 검색 조건",
      in: 'query',
      type: 'string',
      example: '{\"createdAt\": {\"$gte\": \"2024.04\", \"$lt\": \"2024.05\"}}'
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
      example: '{\"createdAt\": 1}',
      default: '{\"createdAt\": -1}'
    }
    
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderListRes" }
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
    const sellerOrderModel = req.model.sellerOrder;
    logger.trace(req.query);

    // 검색 옵션
    let search = {};
    const state = req.query.state;
    const user_id = Number(req.query.user_id);
    const custom = req.query.custom;

    if(state){
      search['state'] = state;
    }

    if(user_id){
      search['user_id'] = user_id;
    }
    
    if(custom){
      search = { ...search, ...JSON.parse(custom) };
    }

    // 정렬 옵션
    let sortBy = JSON.parse(req.query.sort || '{}');

    // 기본 정렬 옵션은 구매일의 내림차순
    sortBy['createdAt'] = sortBy['createdAt'] || -1; // 내림차순

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);

    const result = await sellerOrderModel.findBy({seller_id: req.user._id, search, sortBy, page, limit });
    res.json({ ok: 1, ...result });

  }catch(err){
    next(err);
  }
});

// 주문 상세 조회
router.get('/:_id', [
  param('_id').isInt().withMessage('주문 id는 정수만 지정 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

   /*
    #swagger.tags = ['주문 관리']
    #swagger.summary  = '주문 상세 조회'
    #swagger.description = '주문 상세 내역을 조회합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: '주문 id',
      in: 'path',
      required: true,
      type: 'number',
      example: '2'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/orderInfoSellerRes" }
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
    const sellerOrderModel = req.model.sellerOrder;
    const item = await sellerOrderModel.findById(Number(req.params._id), req.user._id);
    if(item){
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 상품별 주문 상태 수정
router.patch('/:_id/products/:product_id', [
  body('state').trim().notEmpty().withMessage('주문 상태 코드를 전달해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

   /*
    #swagger.tags = ['주문 관리']
    #swagger.summary  = '상품별 주문 상태 수정'
    #swagger.description = '상품별로 주문 상태를 수정합니다.(배송 시작, 환불 완료 등)<br>여러 판매자의 상품을 한번에 주문하고 결제했을 경우 하나의 주문에 여러 상품이 있고 각 상품별로 주문 상태를 관리하고 싶을 때 사용합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: "주문 id",
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
      description: "수정할 주문 정보가 저장된 객체입니다.<br>state: 주문한 상품의 state 값으로 지정됩니다.<br>나머지 속성은 주문한 상품의 history 속성에 추가됩니다.",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderProductSellerBody" },
        }
      }
    },

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderProductSellerRes" },
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
    const orderModel = req.model.order;
    const _id = Number(req.params._id);
    const product_id = Number(req.params.product_id);
    const order = await orderModel.findById(_id);

    // 주문 내역 중 내 상품만 조회
    const orderProducts = _.filter(order.products, { _id: product_id, seller_id: req.user._id });

    if(req.user.type === 'admin' || orderProducts.length > 0){
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

// 주문별 주문 상태 수정
router.patch('/:_id', async function(req, res, next) {

   /*
    #swagger.tags = ['주문 관리']
    #swagger.summary  = '주문별 주문 상태 수정'
    #swagger.description = '주문별로 주문 상태를 수정합니다.(배송 시작, 환불 완료 등)<br>하나의 주문에 하나의 상품만 있을 경우 주문별로 주문 상태를 관리하고 싶을 때 사용합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: "주문 id",
      in: 'path',
      type: 'number',
      example: 2
    }
    #swagger.requestBody = {
      description: "수정할 주문 정보가 저장된 객체입니다.<br>state: 주문 정보의 state 값으로 지정됩니다.<br>나머지 속성은 주문 정보의 history 속성에 추가됩니다.",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderSellerBody" },
        }
      }
    },

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/updateOrderSellerRes" },
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
    const orderModel = req.model.order;
    const _id = Number(req.params._id);
    const order = await orderModel.findById(_id);

    if(order){
      // 주문 내역 중 내 상품만 조회
      const orderProducts = _.filter(order.products, { seller_id: req.user._id });

      if(req.user.type === 'admin' || orderProducts.length > 0){
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
    }else{
      next();
    }

    
  }catch(err){
    next(err);
  }
});



export default router;
