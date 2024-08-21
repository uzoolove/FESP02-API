import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';

import jwtAuth from '#middlewares/jwtAuth.js';

const router = express.Router();

// 상품 목록 조회
router.get('/', [
    query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
    query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
  ], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '상품 목록 조회'
    #swagger.description = `상품 목록을 조회합니다.<br>
      지원되는 검색 조건 이외의 속성으로 검색할 경우 custom 파라미터를 이용하면 됩니다.<br>
      custom 파라미터에 지정하는 값은 MongoDB 검색어로 사용되며, api 클라이언트 프로그램의 샘플 예제 이외에 더 자세한 검색 조건 지정은 다음 문서를 참고하세요.<br>
      <a target="_blank" href="https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document">검색어 지정 방법</a>`

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
      example: 2500
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
      example: '{\"extra.isNew\": true}'
    }
    #swagger.parameters['page'] = {
      description: "페이지",
      in: 'query',
      type: 'number',
      example: 2
    }
    #swagger.parameters['limit'] = {
      description: `한 페이지당 항목 수<br>
        지정하지 않으면 최대 100개 까지 응답  
      `,
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

    #swagger.parameters['showSoldOut'] = {
      description: "매진 상품 포함 여부",
      in: 'query',
      type: 'boolean',
      example: true
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productListRes" }
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
    logger.trace(req.query);

    // 검색
    // 옵션이 있는 상품일 경우 메인 상품은 extra.depth:1, 옵션은 extra.depth: 2로 저장하므로 메인 상품 목록은 옵션을 제외하고 검색
    let search = { 'extra.depth': { $ne: 2 } };
    // let search = {};

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const minShippingFees = Number(req.query.minShippingFees);    
    const maxShippingFees = Number(req.query.maxShippingFees);    
    const seller = Number(req.query.seller_id);
    const keyword = req.query.keyword;
    const custom = req.query.custom;
    const showSoldOut = req.query.showSoldOut === 'true' ? true : false;

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

    if(seller){
      search['seller_id'] = seller;
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

    // 기본 정렬 옵션은 _id의 내림차순
    sortBy['_id'] = sortBy['_id'] || -1; // 내림차순

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);

    // 자신의 북마크 여부 확인을 위해서 회원 정보 조회
    (await jwtAuth.auth('user'))(req, res, ()=>{});
  
    const result = await productModel.findBy({ search, sortBy, page, limit, showSoldOut, userId: req.user?._id });
    
    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

// 상품 상세 조회
router.get('/:_id', async function(req, res, next) {

  /*
    #swagger.tags = ['상품']
    #swagger.summary  = '상품 상세 조회'
    #swagger.description = '상품 상세 정보를 조회합니다.'
    
    #swagger.parameters['_id'] = {
      description: "상품 id",
      in: 'path',
      type: 'number',
      example: 4
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/productInfoRes" }
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
    const productModel = req.model.product;

    // 자신의 북마크 여부 확인을 위해서 회원 정보 조회
    (await jwtAuth.auth('user'))(req, res, ()=>{});

    const item = await productModel.findById({ _id: Number(req.params._id), userId: req.user?._id });
    if(item){
      res.json({ ok: 1, item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

export default router;
