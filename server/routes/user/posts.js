import express from 'express';
import _ from 'lodash';
import { query, body } from 'express-validator';
import jwtAuth from '#middlewares/jwtAuth.js';
import validator from '#middlewares/validator.js';

const router = express.Router();

// 게시글 등록
router.post('/', jwtAuth.auth('user', true), [
  body('title').optional().trim().isLength({ min: 2 }).withMessage('제목은 2글자 이상 입력해야 합니다.'),
  body('content').optional().trim().isLength({ min: 2 }).withMessage('내용은 2글자 이상 입력해야 합니다.'),
  body('tag').optional().trim().isLength({ min: 2 }).withMessage('태그는 2글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '게시글 등록'
    #swagger.description = '게시글을 등록합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.requestBody = {
      description: `게시글 정보가 저장된 객체입니다.<br>
        모든 속성은 선택사항입니다.<br>
        type, title, content, tag 속성은 목록 조회에서 확인할 수 있습니다.<br>
        이외에 지정된 속성은 상세 조회에서만 확인할 수 있습니다.<br>
        type: 게시판 종류를 나타내고 게시판을 구분할 수 있는 이름이며 자유롭게 지정할 수 있고 게시물 목록 조회시 전달해야 합니다.(생략시 post)<br>
        title: 제목(키워드 검색에 사용)<br>
        content: 내용(키워드 검색에 사용)<br>
        tag: 태그(키워드 검색에 사용)<br>
        product_id: 상품 id를 나타내고 상품과 관련된 게시글일 경우에 어떤 상품에 대한 게시글인지 식별하기 위해 필요합니다.`,
      required: true,
      content: {
        "application/json": {
          examples: {
            "일반 게시판": { $ref: "#/components/examples/createPostExample" },
            "상품 Q&A 게시판": { $ref: "#/components/examples/createPostQnAExample" },            
          }
        }
      }
    }

    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/postCreateRes" }
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
    const postModel = req.model.post;
    let user = req.user;
    if(!user){
      user = { _id: 0, name: req.body.name || '익명' };
    }
    const item = await postModel.create({ ...req.body, views: 0, user });
    res.status(201).json( {ok: 1, item} );
  }catch(err){
    next(err);
  }
});

// 게시글 목록 조회
router.get('/', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], jwtAuth.auth('user', true), validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '전체 게시글 목록'
    #swagger.description = '전체 게시글 목록을 조회합니다.<br>지원되는 검색 조건 이외의 속성으로 검색할 경우 custom 파라미터를 이용하면 됩니다.'
    
    #swagger.parameters['type'] = {
      description: "게시판 종류",
      in: 'query',
      type: 'string',
      default: 'post',
      example: 'qna'
    }
    #swagger.parameters['keyword'] = {
      description: "검색어<br>제목, 내용, 태그 검색에 사용되는 키워드",
      in: 'query',
      type: 'string',
      example: '배송'
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
          schema: { $ref: "#/components/schemas/postListRes" }
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
    const postModel = req.model.post;
    let search = {};
    const keyword = req.query.keyword;
    const custom = req.query.custom;

    if(keyword){
      const regex = new RegExp(keyword, 'i');
      search['$or'] = [{ title: regex }, { content: regex }, { tag: regex }];
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

    const result = await postModel.find({ type: req.query.type, userId: req.user?._id, search, sortBy, page, limit });
    

    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

// 내가 작성한 게시글 목록 조회
router.get('/users', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], jwtAuth.auth('user'), validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '내가 작성한 게시글 목록'
    #swagger.description = '내가 작성한 게시글 목록을 조회합니다.'
      
    #swagger.parameters['type'] = {
      description: "게시판 종류",
      in: 'query',
      type: 'string',
      default: 'post',
      example: 'qna'
    }
    #swagger.parameters['keyword'] = {
      description: "검색어<br>제목과 내용 검색에 사용되는 키워드",
      in: 'query',
      type: 'string',
      example: '배송'
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
      default: '{\"_id\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/postListRes" }
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
    const postModel = req.model.post;
    const _id = req.user._id;

    let search = { 'user._id': _id };
    const keyword = req.query.keyword;
    const custom = req.query.custom;
    
    if(keyword){
      const regex = new RegExp(keyword, 'i');
      search['$or'] = [{ title: regex }, { content: regex }];
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

    const item = await postModel.find({ type: req.query.type, userId: req.user?._id, search, sortBy, page, limit });
    res.json({ ok: 1, ...item });
  }catch(err){
    next(err);
  }
});

// 지정한 사용자가 작성한 게시글 목록 조회
router.get('/users/:_id', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '지정한 사용자가 작성한 게시글 목록'
    #swagger.description = '지정한 사용자가 작성한 게시글 목록을 조회합니다.'
      
    #swagger.parameters['_id'] = {
      description: "조회할 사용자 id",
      in: 'path',
      type: 'number',
      example: 4
    }

    #swagger.parameters['type'] = {
      description: "게시판 종류",
      in: 'query',
      type: 'string',
      default: 'post',
      example: 'qna'
    }
    #swagger.parameters['keyword'] = {
      description: "검색어<br>제목과 내용 검색에 사용되는 키워드",
      in: 'query',
      type: 'string',
      example: '배송'
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
      default: '{\"_id\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/postListRes" }
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
    const postModel = req.model.post;
    const _id = Number(req.params._id);

    let search = { 'user._id': _id };
    const keyword = req.query.keyword;
    const custom = req.query.custom;
    
    if(keyword){
      const regex = new RegExp(keyword, 'i');
      search['$or'] = [{ title: regex }, { content: regex }];
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

    const item = await postModel.find({ type: req.query.type, userId: req.user?._id, search, sortBy, page, limit });
    res.json({ ok: 1, ...item });
  }catch(err){
    next(err);
  }
});

// 판매자의 상품에 등록된 게시글 목록 조회
router.get('/seller/:_id', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '판매자의 상품에 등록된 게시글 목록'
    #swagger.description = '판매자의 상품에 등록된 게시글 목록을 조회합니다.'
    
    #swagger.parameters['_id'] = {
      description: "판매자 id",
      in: 'path',
      type: 'number',
      example: 2
    }
    #swagger.parameters['product_id'] = {
      description: "상품 id",
      in: 'query',
      type: 'number',
      example: 1
    }
    #swagger.parameters['type'] = {
      description: "게시판 종류",
      in: 'query',
      type: 'string',
      default: 'post',
      example: 'qna'
    }
    #swagger.parameters['keyword'] = {
      description: "검색어<br>제목과 내용 검색에 사용되는 키워드",
      in: 'query',
      type: 'string',
      example: '배송'
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
      default: '{\"_id\": -1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/postListRes" }
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
    const postModel = req.model.post;
    const sellerId = Number(req.params._id);
    const productId = Number(req.query.product_id);
    // if(req.user.type === 'seller' && sellerId === req.user._id){

      let search = { seller_id: sellerId };
      const keyword = req.query.keyword;
      const custom = req.query.custom;

      if(productId){
        search.product_id = productId;
      }

      if(keyword){
        const regex = new RegExp(keyword, 'i');
        search['$or'] = [{ title: regex }, { content: regex }];
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

      const item = await postModel.find({ type: req.query.type, userId: req.user?._id, search, sortBy, page, limit });
      res.json({ ok: 1, ...item });
    // }else{
    //   next();
    // }
  }catch(err){
    next(err);
  }
});

// 게시글 상세 조회
router.get('/:_id', jwtAuth.auth('user', true), async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '게시글 상세'
    #swagger.description = `게시글을 상세 조회합니다.<br>
      상품 게시글일 경우 product 속성에 상품명, 상품이미지가 추가됩니다.`
    
    #swagger.parameters['_id'] = {
      description: "게시글 id",
      in: 'path',
      type: 'number',
      example: 1
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "게시물": { $ref: "#/components/examples/postDetailRes" },
            "상품 게시물": { $ref: "#/components/examples/productPostDetailRes" },
          }
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
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const item = await postModel.findById({ _id, userId: req.user?._id, incView: true });
    if(item){
      // private 게시글일 경우 작성자 또는 share 목록에 등록된 사용자가 아니면 404 응답
      if(item.private && !(item.user._id === req.user?._id || item.share?.includes(req.user?._id))){
        next();
      }else{
        res.json({ ok: 1, item });
      }
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 게시글 수정
router.patch('/:_id', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '게시글 수정'
    #swagger.description = '게시글을 수정한다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
    #swagger.parameters['_id'] = {
      description: "게시글 id",
      in: 'path',
      type: 'number',
      example: 1
    }

    #swagger.requestBody = {
      description: "수정할 게시글 정보",
      required: true,
      content: {
        "application/json": {
          examples: {
            "샘플": { $ref: "#/components/examples/updatePostBody" },
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "샘플": { $ref: "#/components/examples/updatePostRes" },
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
      description: '게시글이 존재하지 않거나 접근 권한이 없음',
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
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const post = await postModel.findById({ _id, userId: req.user._id });
    if(post && (req.user.type === 'admin' || post.user._id == req.user._id)){
      const updated = await postModel.update(_id, req.body);
      res.json({ ok: 1, item: updated });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 게시글 삭제
router.delete('/:_id', jwtAuth.auth('user'), async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '게시글 삭제'
    #swagger.description = '게시글을 삭제합니다.'
    
    #swagger.security = [{
      "Access Token": []
    }]

    #swagger.parameters['_id'] = {
      description: '게시글 id',
      in: 'path',
      required: true,
      type: 'number',
      example: '2'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/simpleOK" }
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
      description: '게시글이 존재하지 않거나 접근 권한이 없음',
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
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const post = await postModel.findById({ _id, userId: req.user._id });
    if(post && (req.user.type === 'admin' || post?.user._id == req.user._id)){
      await postModel.delete(_id);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 목록 조회
router.get('/:_id/replies', [
  query('custom').optional().isJSON().withMessage('custom 값은 JSON 형식의 문자열이어야 합니다.'),
  query('sort').optional().isJSON().withMessage('sort 값은 JSON 형식의 문자열이어야 합니다.')
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '댓글 목록'
    #swagger.description = '지정한 게시글의 댓글 목록을 조회합니다.'
    
    #swagger.parameters['_id'] = {
      description: '게시글 id',
      in: 'path',
      required: true,
      type: 'number',
      example: 1
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
      default: '{\"_id\": 1}'
    }

    #swagger.responses[200] = {
      description: '성공',
      content: {
        "application/json": {
          examples: {
            "샘플": { $ref: "#/components/examples/listReplyRes" }
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
    const postModel = req.model.post;
    let sortBy;
    // 정렬 옵션
    if(req.query.sort){
      sortBy = JSON.parse(req.query.sort);
    }else{
      // 기본 정렬 옵션은 _id의 오름차순
      sortBy = { _id: 1 };
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 0);

    const result = await postModel.findReplies({ _id: Number(req.params._id), page, limit, sortBy });

    res.json({ ok: 1, ...result });
  }catch(err){
    next(err);
  }
});

// 댓글 등록
router.post('/:_id/replies', jwtAuth.auth('user', true),  [
  body('content').trim().isLength({ min: 2 }).withMessage('내용은 2글자 이상 입력해야 합니다.'),
], validator.checkResult, async function(req, res, next) {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '댓글 등록'
    #swagger.description = '게시글에 댓글을 등록합니다.'
    
    #swagger.requestBody = {
      description: `댓글 정보가 저장된 객체입니다.<br>
        필요한 속성은 자유롭게 추가할 수 있습니다.<br><br>
        content: 내용(필수)<br>
        name: 작성자(선택, 전달하면 서버에 user.name 속성으로 저장됨)`,
      required: true,
      content: {
        "application/json": {
          examples: {
            "회원 댓글": { $ref: "#/components/examples/createMemberReply" },
            "비회원 댓글": { $ref: "#/components/examples/createReply" },    
          }
        }
      }
    }

    #swagger.responses[201] = {
      description: '성공',
      content: {
        "application/json": {
          examples: { 
            "회원 댓글": { $ref: "#/components/examples/createMemberReplyRes" },
            "비회원 댓글": { $ref: "#/components/examples/createReplyRes" },
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
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const post = await postModel.findById({ _id, userId: req.user?._id });
    if(post){
      const reply = req.body;
      // reply._id = (_.maxBy(post.replies, '_id')?._id || 0) + 1;
      reply.user = {
        _id: req.user?._id,
        name: req.user?.name || req.name, // 익명댓글일 경우 name 속성에 작성자 이름
        email: req.user?.email,
        image: req.user?.image
      };
      // reply.user_id = req.user._id;
      const item = await postModel.createReply(_id, reply);
      res.status(201).json({ok: 1, item});
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 수정
router.patch('/:_id/replies/:reply_id', jwtAuth.auth('user'), async (req, res, next) => {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '댓글 수정'
    #swagger.description = '게시글의 댓글을 수정한다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
  */

  try{
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const reply_id = Number(req.params.reply_id);
    const post = await postModel.findById({ _id, userId: req.user._id });
    const reply = _.find(post?.replies, { _id: reply_id });
    if(post && (req.user.type === 'admin' || reply?.user._id == req.user._id)){
      const item = await postModel.updateReply(_id, reply_id, req.body);
      res.json({ ok: 1 , item });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});

// 댓글 삭제
router.delete('/:_id/replies/:reply_id', jwtAuth.auth('user'), async (req, res, next) => {

  /*
    #swagger.tags = ['게시판']
    #swagger.summary  = '댓글 삭제'
    #swagger.description = '게시글의 댓글을 삭제한다.'
    
    #swagger.security = [{
      "Access Token": []
    }]
    
  */

  try{
    const postModel = req.model.post;
    const _id = Number(req.params._id);
    const reply_id = Number(req.params.reply_id);
    const post = await postModel.findById({ _id, userId: req.user._id });
    const reply = _.find(post?.replies, { _id: reply_id });
    if(post && (req.user.type === 'admin' || reply?.user._id == req.user._id)){
      await postModel.deleteReply(_id, reply_id);
      res.json({ ok: 1 });
    }else{
      next();
    }
  }catch(err){
    next(err);
  }
});


export default router;
