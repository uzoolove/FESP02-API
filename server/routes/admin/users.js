import express from 'express';
import { query } from 'express-validator';

import logger from '#utils/logger.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 회원 목록 조회
router.get('/', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['회원 관리']
    #swagger.summary  = '회원 목록 조회'
    #swagger.description = '회원 목록을 조회합니다.<br>password, accessToken을 제외한 모든 사용자 정보를 반환합니다.<br>지원되는 검색 조건 이외의 속성으로 검색할 경우 custom 파라미터를 이용하면 됩니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: "회원 id",
      in: 'query',
      type: 'number',
      example: '4'
    }
    #swagger.parameters['email'] = {
      description: "회원 이메일",
      in: 'query',
      type: 'string',
      example: 'u1@market.com'
    }
    #swagger.parameters['name'] = {
      description: "회원 이름<br>정확히 일치하는 이름을 찾습니다.",
      in: 'query',
      type: 'string',
      example: '제이지'
    }
    #swagger.parameters['phone'] = {
      description: "회원 전화번호",
      in: 'query',
      type: 'string',
      example: '01044445555'
    }
    #swagger.parameters['type'] = {
      description: "회원 구분 (user | seller | admin)",
      in: 'query',
      type: 'string',
      example: 'user'
    }
    #swagger.parameters['address'] = {
      description: "회원 주소<br>지정한 검색어가 포함된 주소를 찾습니다.",
      in: 'query',
      type: 'string',
      example: '서울'
    }
    #swagger.parameters['custom'] = {
      description: "custom 검색 조건<br>생일이 11월인 사용자 조회 예시",
      in: 'query',
      type: 'string',
      example: '{\"extra.birthday\":{\"$gte\": \"11\", \"$lt\": \"12\"}}'
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
          schema: { $ref: "#/components/schemas/userListRes" }
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
    const adminUserModel = req.model.adminUser;
    logger.trace(req.query);

    let search = {};

    const _id = req.query._id;
    const email = req.query.email;
    const name = req.query.name;
    const phone = req.query.phone;
    const type = req.query.type;
    const address = req.query.address;
    const custom = req.query.custom;

    if(_id){
      search['_id'] = Number(_id);
    }
    if(email){
      search['email'] = email;
    }
    if(name){
      search['name'] = name;
    }
    if(phone){
      search['phone'] = phone;
    }
    if(type){
      search['type'] = type;
    }
    if(address){
      const regex = new RegExp(address, 'i');
      search['address'] = { '$regex': regex };
    }

    if(custom){
      search = { ...search, ...JSON.parse(custom) };
    }

    // 정렬 옵션
    const sortBy = JSON.parse(req.query.sort || '{}');

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);

    const result = await adminUserModel.find({ search, sortBy, page, limit });
    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

export default router;
