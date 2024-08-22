import logger from '#utils/logger.js';
import { db as DBConfig } from '#config/index.js';
import { MongoClient } from 'mongodb';
import codeUtil from '#utils/codeUtil.js';

const connections = {};

// Connection URL
const url = DBConfig.url;

export const getDB = (clientId) => connections[clientId].db;
export const getClient = (clientId) => connections[clientId].client;

logger.log(`DB 접속 시도: ${url}`);

for(const clientId of DBConfig.clientIds){
  try{
    const client = new MongoClient(url);

    await client.connect();
    logger.info(`DB 접속 성공: ${url}/${clientId}`);
    const db = client.db(clientId);
    db.user = db.collection('user');
    db.product = db.collection('product');
    db.cart = db.collection('cart');
    db.order = db.collection('order');
    db.reply = db.collection('reply');
    db.seq = db.collection('seq');
    db.code = db.collection('code');
    db.bookmark = db.collection('bookmark');
    db.config = db.collection('config');
    db.post = db.collection('post');
    db.notification = db.collection('notification');

    db.nextSeq = async _id => {
      let result = await db.seq.findOneAndUpdate({ _id }, { $inc: { no: 1 } });
      if(!result){
        result = { _id, no: 1 };
        await db.seq.insertOne({ _id, no: 2});
      }
      console.log('nextseq', result.no)
      return result.no;
    }

    connections[clientId] = {
      db,
      client
    };

    await codeUtil.initCode(clientId, db);
    await codeUtil.initConfig(clientId, db);
  }catch(err){
    logger.error(err);
  }
}

export default connections;