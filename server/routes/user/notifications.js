import express from 'express';
import { query, body } from 'express-validator';

import validator from '#middlewares/validator.js';
import jwtAuth from '#middlewares/jwtAuth.js';

const router = express.Router();

// 알림 등록
router.post('/', jwtAuth.auth('user'), [
  // body('type').trim().notEmpty().withMessage('type은 필수로 전달해야 합니다.'),
  body('target_id').isInt().withMessage('target_id는 정수로 전달해야 합니다.'),
  body('content').trim().notEmpty().withMessage('content는 필수로 전달해야 합니다.'),
  body('extra').optional().isObject().withMessage('extra 데이터는 객체로 전달해야 합니다.'),
], validator.checkResult, async function(req, res, next) {
/*
    #swagger.tags = ['알림 메세지']
    #swagger.summary  = '알림 메세지 등록'
    #swagger.description = `알림 메세지를 등록합니다.<br>
      알림 메세지를 등록한 후 등록된 정보를 반환합니다.`

    #swagger.requestBody = {
      description: `알림 메세지가 저장된 객체입니다.<br>
        target_id: (필수) 대상 회원 ID<br>
        content: (필수) 알림 메세지<br>
        type: (선택) 알림 종류를 구분하는 값<br>
        channel: (선택) 알림을 전달하는 방법, none, websocket, email, sms, slack, discode ... 등의 방법을 지정(추후 지원)<br>
        extra: (선택) 추가 데이터, 추가하고 싶은 아무 속성이나 지정`,
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/createNotification' },
          examples: {
            "샘플": { $ref: "#/components/examples/createNotification" },
          }
        }
      }
    }
    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "샘플": { $ref: "#/components/examples/createNotificationRes" },
          }
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
    const notificationModel = req.model.notification;
    const user = {};
    if(req.user){
      user._id = req.user._id;
      user.name = req.user.name;
      user.email = req.user.email;
      user.image = req.user.image;
    }

    const item = await notificationModel.create({ ...req.body, user });
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});


// 내 알림 목록 조회
router.get('/', jwtAuth.auth('user'), [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {
/*
    #swagger.tags = ['알림 메세지']
    #swagger.summary  = '내 알림 목록 조회'
    #swagger.description = `읽지 않은 나의 알림 목록을 조회합니다.<br>
      한번 조회된 알림은 읽은 상태가 되면서 다시 조회되지 않습니다.`
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['custom'] = {
      description: "custom 검색 조건(type이 qna인 메세지 조회 예시)",
      in: 'query',
      type: 'string',
      example: '{\"type\": \"qna\"}'
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
      default: '{\"_id\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/notificationListRes" }
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
    const notificationModel = req.model.notification;
    let search = {};
    const custom = req.query.custom;

    if(custom){
      search = { ...JSON.parse(custom) };
    }

    // 정렬 옵션
    let sortBy = JSON.parse(req.query.sort || '{}');
    // 기본 정렬 옵션은 _id의 내림차순
    sortBy['_id'] = sortBy['_id'] || -1; // 내림차순

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);

    const result = await notificationModel.find({ userId: req.user._id, search, sortBy, page, limit, setRead: true });
    
    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});


export default router;
