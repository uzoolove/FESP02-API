import logger from '../utils/logger.js';

import { db as DBConfig } from '#config/index.js';
import { getDB } from '#utils/dbUtil.js';

import AdminUserModel from '#models/admin/user.model.js';

import CodeModel from '#models/code/code.model.js';

import SellerOrderModel from '#models/seller/order.model.js';
import SellerProductModel from '#models/seller/product.model.js';

import BookmarkModel from '#models/user/bookmark.model.js';
import CartModel from '#models/user/cart.model.js';
import OrderModel from '#models/user/order.model.js';
import PostModel from '#models/user/post.model.js';
import ProductModel from '#models/user/product.model.js';
import ReplyModel from '#models/user/reply.model.js';
import UserModel from '#models/user/user.model.js';
import NotificationModel from '#models/user/notification.model.js';

export const models = {};
for(const clientId of DBConfig.clientIds){
  models[clientId] = {};
  models[clientId].adminUser = new AdminUserModel(getDB(clientId), models[clientId]);
  models[clientId].code = new CodeModel(getDB(clientId), models[clientId]);
  models[clientId].sellerOrder = new SellerOrderModel(getDB(clientId), models[clientId]);
  models[clientId].sellerProduct = new SellerProductModel(getDB(clientId), models[clientId]);
  models[clientId].bookmark = new BookmarkModel(getDB(clientId), models[clientId]);
  models[clientId].cart = new CartModel(clientId, getDB(clientId), models[clientId]);
  models[clientId].order = new OrderModel(clientId, getDB(clientId), models[clientId]);
  models[clientId].post = new PostModel(getDB(clientId), models[clientId]);
  models[clientId].product = new ProductModel(getDB(clientId), models[clientId]);
  models[clientId].reply = new ReplyModel(getDB(clientId), models[clientId]);
  models[clientId].user = new UserModel(getDB(clientId), models[clientId]);
  models[clientId].notification = new NotificationModel(clientId, getDB(clientId), models[clientId]);
}

function setDBModel(req, res, next){
  const clientId = req.clientId = req.headers['client-id']/* || '00-sample';*/
  logger.info(`client-id: [${clientId}]`);
  if(clientId){
    if(DBConfig.clientIds.includes(clientId)){
      req.model = models[clientId];
      next();
    }else{
      res.status(403).json({ ok: 0, message: '등록되지 않은 client-id 입니다.' });
    }
  }else{
    res.status(400).json({ ok: 0, message: 'client-id 헤더가 없습니다.' });
  }
}

export const getDBModel = (clientId, collection) => {
  return models[clientId][collection];
};

export default setDBModel;