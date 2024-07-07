import express from 'express';
import { query, body } from 'express-validator';
import createError from 'http-errors';
import _ from 'lodash';

import logger from '#utils/logger.js';
import jwtAuth from '#middlewares/jwtAuth.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 장바구니 목록 조회(비로그인 상태)
router.post('/local', [
  body('products').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
  body('products.*._id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('products.*.quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 목록 조회(비로그인)'
    #swagger.description = '로그인 되지 않은 상태에서 장바구니 목록을 조회합니다.<br>요청 바디에 상품 정보와 수량을 전달하면 장바구니 화면 구성에 필요한 상품 정보와 가격 정보를 응답합니다.'
    
    #swagger.requestBody = {
      description: "장바구니 목록 조회를 위한 상품 정보가 저장된 객체입니다.<br>products 속성은 필수이며 객체 배열입니다.<br>배열의 요소인 객체는 다음과 같은 필수 정보를 포함해야 하고 추가 속성은 자유롭게 지정하면 됩니다.<br>_id: 상품 id<br>quantity: 구매 수량",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/cartList' },
        }
      }
    },

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartListRes" }
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
  const cartModel = req.model.cart;
  try{
    const item = await cartModel.findLocalCart(req.body);
    const cost = item.cost;
    delete item.cost;
    res.json({ ok: 1, item, cost });
  }catch(err){
    next(err);
  }
});

// 장바구니에 담기
router.post('/', jwtAuth.auth('user'), [
  body('product_id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니에 상품 추가'
    #swagger.description = '장바구니에 상품을 추가합니다.<br>이미 장바구니에 추가된 상품일 경우 수량이 증가하고 새로운 상품이 추가될 경우 목록에 추가됩니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: "장바구니에 추가할 상품 정보가 저장된 객체입니다.<br>다음과 같은 필수 정보를 포함해야 합니다.<br>product_id: 상품 id<br>quantity: 구매 수량",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/cartCreate' },
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공<br>추가된 상품을 포함한 장바구니 목록이 반환됩니다.',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartCreateRes" }
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

  const cartModel = req.model.cart;
  try{
    req.body.user_id = req.user._id;
    const item = await cartModel.create(req.body);
    res.status(201).json({ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 장바구니 목록 조회(로그인 상태)
router.get('/', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 목록 조회(로그인)'
    #swagger.description = '로그인 한 사용자의 장바구니 목록을 조회합니다.'
    
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartListLoginRes" }
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
    
    #swagger.security = [{
      "Access Token": []
    }]
    
  */
  const cartModel = req.model.cart;
  try{
    const user_id = req.user._id;
    const item = await cartModel.findByUser(user_id, req.body.discount);
    const cost = item.cost;
    delete item.cost;
    res.json({ ok: 1, item, cost });
  }catch(err){
    next(err);
  }
});

// 장바구니 상품 수량 수정
router.patch('/:_id', jwtAuth.auth('user'), [
  body('quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 상품 수량 수정'
    #swagger.description = '장바구니 상품의 수량을 수정합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: "장바구니 id",
      in: 'path',
      type: 'number',
      example: 2
    }

    #swagger.requestBody = {
      description: "수량이 저장된 객체입니다.<br>quantity: 수정할 수량(필수, 정수)",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartUpdate" },
        }
      }
    },
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartUpdateRes" },
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
    const cartModel = req.model.cart;
    const _id = Number(req.params._id);
    const cart = await cartModel.findById(_id);
    if(req.user.type === 'admin' || cart?.user_id == req.user._id){
      const updated = await cartModel.update(_id, req.body.quantity);
      res.json({ ok: 1, item: updated });
    }else{
      next(); // 404
    }
  }catch(err){
    next(err);
  }
});

// 장바구니 비우기
router.delete('/cleanup', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 비우기'
    #swagger.description = '장바구니를 비웁니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
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
    const cartModel = req.model.cart;
    const result = await cartModel.cleanup(req.user._id);
    res.json({ ok: 1 });
  }catch(err){
    next(err);
  }
});

// 장바구니 상품 삭제(한건)
router.delete('/:_id', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 상품 한건 삭제'
    #swagger.description = '장바구니 상품을 한건 삭제합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: "장바구니 id",
      in: 'path',
      type: 'number',
      example: 2
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/simpleOK" },
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
    const cartModel = req.model.cart;
    const _id = Number(req.params._id);
    const cart = await cartModel.findById(_id);
    if(req.user.type === 'admin' || cart?.user_id == req.user._id){
      await cartModel.delete(_id);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 장바구니 상품 삭제(여러건)
router.delete('/', jwtAuth.auth('user'), [
  body('carts').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 상품 여러건 삭제'
    #swagger.description = '장바구니 상품을 여러건 삭제합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.requestBody = {
      description: "삭제할 장바구니 정보가 저장된 객체입니다.<br>carts: 삭제할 장바구니 id 목록(필수, 배열)",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/cartDeleteBody' },
        }
      }
    },
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
    const cartModel = req.model.cart;
    const myCarts = await cartModel.findByUser(req.user._id);
    const isMine = _.every(req.body.carts, _id => _.some(myCarts, cart => _.isEqual(cart._id, _id)));
    if(req.user.type === 'admin' || isMine){
      await cartModel.deleteMany(req.body.carts);
      res.json({ ok: 1 });
    }else{
      next(createError(422, `본인의 장바구니 상품만 삭제 가능합니다.`));
    }
  }catch(err){
    next(err);
  }
});

// 장바구니 상품 전체 교체
router.put('/replace', jwtAuth.auth('user'), [
  body('products').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
  body('products.*._id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('products.*.quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 상품 전체 교체'
    #swagger.description = '장바구니 상품 전체를 교체합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.requestBody = {
      description: "장바구니 정보가 저장된 객체입니다.<br>products 속성은 필수이며 객체 배열입니다.<br>배열의 요소인 객체는 다음과 같은 필수 정보를 포함해야 합니다.<br>_id: 상품 id<br>quantity: 구매 수량",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/cartMergeBody' },
        }
      }
    },
    #swagger.responses[200] = {
      description: '성공<br>교체된 장바구니 목록이 반환됩니다.',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartCreateRes" },
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
    const cartModel = req.model.cart;
    await cartModel.cleanup(req.user._id);
    const item = await cartModel.add(req.user._id, req.body.products);
    res.json({ ok: 1, item});
  }catch(err){
    next(err);
  }
});

// 장바구니 상품 합치기
router.put('/', jwtAuth.auth('user'), [
  body('products').isArray().withMessage('상품 목록은 배열로 전달해야 합니다.'),
  body('products.*._id').isInt().withMessage('상품 id는 정수만 입력 가능합니다.'),
  body('products.*.quantity').isInt().withMessage('상품 수량은 정수만 입력 가능합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['장바구니']
    #swagger.summary  = '장바구니 합치기'
    #swagger.description = '지정한 상품 목록을 장바구니에 합칩니다.<br>이미 장바구니에 추가된 상품일 경우 수량이 증가하고 새로운 상품이 추가될 경우 목록에 추가됩니다.<br>로그인 하지 않은 상태에서 장바구니에 상품을 담으면 localStorage에 저장해 두고 결제시 로그인을 하게되면 이 API를 호출해서 서버에 저장된 장바구니 상품과 localStorage에 저장된 장바구니 상품을 합칠때 사용합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.requestBody = {
      description: "장바구니 정보가 저장된 객체입니다.<br>products 속성은 필수이며 객체 배열입니다.<br>배열의 요소인 객체는 다음과 같은 필수 정보를 포함해야 합니다.<br>_id: 상품 id<br>quantity: 구매 수량",
      required: true,
      content: {
        "application/json": {
          schema: { $ref: '#components/schemas/cartMergeBody' },
        }
      }
    },
    #swagger.responses[201] = {
      description: '성공<br>합친 상품을 포함한 장바구니 목록이 반환됩니다.',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/cartCreateRes" },
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
    const cartModel = req.model.cart;
    const item = await cartModel.add(req.user._id, req.body.products);
    res.json({ ok: 1, item});
  }catch(err){
    next(err);
  }
});

export default router;
