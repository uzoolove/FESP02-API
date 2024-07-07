import express from 'express';
import { param, query, body } from 'express-validator';
import _ from 'lodash';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 판매 상품 목록 조회
router.get('/', [
    query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
    query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
  ], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.auto = false

    #swagger.tags = ['상품 관리']
    #swagger.summary  = '판매 상품 목록 조회'
    #swagger.description = '자신의 판매 상품 목록을 조회합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['minPrice'] = {
      description: "최저 가격",
      in: 'query',
      type: 'number',
      default: 0,
      example: 10000
    }
    #swagger.parameters['maxPrice'] = {
      description: "최고 가격",
      in: 'query',
      type: 'number',
      default: 99999999999,
      example: 50000
    }
    #swagger.parameters['minShippingFees'] = {
      description: "최저 배송비",
      in: 'query',
      type: 'number',
      default: 0,
      example: 0
    }
    #swagger.parameters['maxShippingFees'] = {
      description: "최고 배송비",
      in: 'query',
      type: 'number',
      default: 99999999999,
      example: 5000
    }
    #swagger.parameters['keyword'] = {
      description: "상품명 검색어",
      in: 'query',
      type: 'string',
      example: '레고'
    }
    #swagger.parameters['seller_id'] = {
      description: "판매자 id",
      in: 'query',
      type: 'number',
      example: 2
    }
    #swagger.parameters['custom'] = {
      description: "custom 검색 조건",
      in: 'query',
      type: 'string',
      example: '{\"extra.isBest\": true}'
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
      example: '{\"price\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/myProductListRes" }
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
    const sellerOrderModel = req.model.sellerOrder;
    const productModel = req.model.product;
    logger.trace(req.query);

    // 검색 옵션
    // 옵션이 있는 상품일 경우 메인 상품은 extra.depth:1, 옵션은 extra.depth: 2로 저장하므로 메인 상품 목록은 옵션을 제외하고 검색
    let search = { 'extra.depth': { $ne: 2 } };

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const minShippingFees = Number(req.query.minShippingFees);    
    const maxShippingFees = Number(req.query.maxShippingFees);
    const keyword = req.query.keyword;
    const custom = req.query.custom;

    if(minPrice >= 0){
      search.price = search.price || {};
      search.price['$gte'] = minPrice;
    }

    if(maxPrice >=0){
      search.price = search.price || {};
      search.price['$lte'] = maxPrice;
    }

    if(minShippingFees >= 0){
      search.shippingFees = search.shippingFees || {};
      search.shippingFees['$gte'] = minShippingFees;
    }

    if(maxShippingFees >= 0){
      search.shippingFees = search.shippingFees || {};
      search.shippingFees['$lte'] = maxShippingFees;
    }

    if(keyword){
      const regex = new RegExp(keyword, 'i');
      search['name'] = { '$regex': regex };
    }
    
    if(custom){
      search = { ...search, ...JSON.parse(custom) };
    }

    // 정렬 옵션
    let sortBy = JSON.parse(req.query.sort || '{}');

    // 기본 정렬 옵션은 등록일의 내림차순
    sortBy['createdAt'] = sortBy['createdAt'] || -1; // 내림차순

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);
  
    const result = await productModel.findBy({ sellerId: req.user._id, search, sortBy, page, limit, userId: req.user._id });
    
    for(const item of result.item){
      const orders = await sellerOrderModel.findByProductId(item._id, req.user._id);
      item.orders = orders.length;
      item.ordersQuantity = _.sumBy(orders, order => {
        return _.sumBy(order.products, 'quantity');
      });
    }

    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

// 판매 상품 상세 조회
router.get('/:_id', [
  param('_id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['상품 관리']
    #swagger.summary  = '판매 상품 상세 조회'
    #swagger.description = '자신의 판매 상품 상세 정보를 조회합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 6
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productInfoRes" }
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
    const productModel = req.model.product;
    const sellerOrderModel = req.model.sellerOrder;
    const _id = Number(req.params._id);
    const seller_id = req.user._id;
    const item = await productModel.findById({ _id, seller_id });
    if(item){
      item.orders = await sellerOrderModel.findByProductId(_id, seller_id);
    }
   
    if(item && (item.seller_id == req.user._id || req.user.type === 'admin')){
      res.json({ok: 1, item});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 상품 등록
router.post('/', [
  body('price').isInt().withMessage('상품 가격은 정수만 입력 가능합니다.'),
  body('quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
  body('name').trim().isLength({ min: 2 }).withMessage('상품명은 2글자 이상 입력해야 합니다.'),
  body('content').trim().isLength({ min: 10 }).withMessage('상품 설명은 10글자 이상 입력해야 합니다.'),
  body('shippingFees').optional().isInt().withMessage('배송비는 정수만 입력 가능합니다.'),
  // body('mainImages').optional().isArray().withMessage('메인 이미지는 배열로 전달해야 합니다.'),
  body('extra').optional().isObject().withMessage('extra 데이터는 객체로 전달해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['상품 관리']
    #swagger.summary  = '상품 등록'
    #swagger.description = '상품을 등록합니다.<br>상품 등록 후 상품 정보를 반환합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: "상품 정보가 저장된 객체입니다.<br>price: 가격(필수)<br>quantity: 수량(필수)<br>name: 상품명(필수)<br>content: 상품 설명(필수)<br>shippingFees: 배송비(선택, 생략시 0원)<br>mainImages: 상품 설명 이미지(선택)<br>show: 상품 노출 여부(선택, 기본값 true). false로 지정될 경우 구매 회원의 상품 목록 조회에 노출되지 않음.<br>extra: 추가 데이터(선택). 추가하고 싶은 아무 속성이나 지정",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/productCreate' }
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productCreateRes" }
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
    const sellerProductModel = req.model.sellerProduct;
    const newProduct = req.body;
    if(newProduct.show === undefined){
      // 구매 회원의 상품 목록에 노출될지 여부
      newProduct.show = true;
    }

    if(newProduct.shippingFees === undefined){
      newProduct.shippingFees = 0;
    }
    
    newProduct.seller_id = req.user._id;
    const item = await sellerProductModel.create(newProduct);
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 상품 수정
router.patch('/:_id', [
  param('_id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('price').optional().isInt().withMessage('상품 가격은 정수만 입력 가능합니다.'),
  body('quantity').optional().isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
  body('shippingFees').optional().isInt().withMessage('배송비는 정수만 입력 가능합니다.'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('상품명은 2글자 이상 입력해야 합니다.'),
  // body('mainImages').optional().isArray().withMessage('메인 이미지는 배열로 전달해야 합니다.'),
  body('content').optional().trim().isLength({ min: 10 }).withMessage('상품 설명은 10글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['상품 관리']
    #swagger.summary  = '상품 수정'
    #swagger.description = '상품을 수정합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: '6'
    }

    #swagger.requestBody = {
      description: "수정될 상품 정보가 저장된 객체입니다.<br>모든 속성은 선택사항입니다.<br>price: 가격<br>name: 상품명<br>content: 상품 설명<br>shippingFees: 배송비<br>mainImages: 상품 설명 이미지<br>show: 상품 노출 여부",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/productUpdate' }
        }
      }
    },

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productUpdateRes" }
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
      description: '상품이 존재하지 않거나 접근 권한 없음',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/error404" }
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
    const sellerProductModel = req.model.sellerProduct;
    const _id = Number(req.params._id);
    const product = await sellerProductModel.findAttrById({ _id, attr: 'seller_id', seller_id: req.user._id });
    if(req.user.type === 'admin' || product?.seller_id == req.user._id){
      const result = await sellerProductModel.update(_id, req.body);
      res.json({ok: 1, item: result});
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

// 상품 삭제
router.delete('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['상품 관리']
    #swagger.summary  = '상품 삭제'
    #swagger.description = '상품을 삭제합니다.'

    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: '6'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/simpleOK" }
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
      description: '상품이 존재하지 않거나 접근 권한 없음',
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
    const sellerProductModel = req.model.sellerProduct;
    const _id = Number(req.params._id);
    const product = await sellerProductModel.findAttrById({ _id, attr: 'seller_id', seller_id: req.user._id });
    if(req.user.type === 'admin' || product?.seller_id == req.user._id){
      const result = await sellerProductModel.delete(_id);
      res.json({ ok: 1 });
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

export default router;
