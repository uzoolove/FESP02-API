import express from 'express';
import _ from 'lodash';

import logger from '#utils/logger.js';
import codeUtil from '#utils/codeUtil.js';

const router = express.Router();

// 코드 목록 조회
router.get('/', async function(req, res, next) {
  /*
    #swagger.auto = false

    #swagger.tags = ['코드 조회']
    #swagger.summary  = '코드 목록 조회'
    #swagger.description = '코드 목록을 조회한다.'

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/codeListRes" }
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
    const clientId = req.clientId;
    const item = {
      nested: codeUtil.getCodeObj(clientId),
      flatten: codeUtil.getCodeFlatten(clientId)
    };
    console.log(req.clientId, item)
    res.json({ ok: 1, item });
  }catch(err){
    next(err);
  }
});

// 코드 한건 조회
router.get('/:_id', async function(req, res, next) {
  /*
    #swagger.tags = ['코드 조회']
    #swagger.summary  = '코드 한건 조회'
    #swagger.description = '코드 한건을 조회한다.'

    #swagger.parameters['_id'] = {
      description: "코드 id",
      in: 'path',
      type: 'string',
      example: 'membershipClass'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/codeDetailRes" }
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
    const codeModel = req.model.code;
    // 검색어 포함
    let item = await codeModel.findById(req.params._id, req.query);
    if(item){
      // 검색 조건이 없을 경우 중첩 객체로 변환
      if(Object.keys(req.query).length === 0 ) {
        item = codeUtil.generateCodeObj([item]);
      }
      res.json({ ok: 1, item });
    }else{
      next();
    }    
  }catch(err){
    next(err);
  }
});

export default router;
