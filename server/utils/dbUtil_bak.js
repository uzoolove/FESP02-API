import logger from './logger.js';
import { db as DBConfig } from '../config/index.js';
import { MongoClient } from 'mongodb';
import codeUtil from '#utils/codeUtil.js';

var db;

// Connection URL
var url;
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || process.env.DB_HOST.endsWith('.aws2.store')){
  if(DBConfig.protocol === 'mongodb+srv'){  // mongodb atlas
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}`;
  }else{
    url = `${DBConfig.protocol}://${DBConfig.user}:${DBConfig.password}@${DBConfig.host}:${DBConfig.port}/${DBConfig.database}`;
  }
}else{
  url = `${DBConfig.protocol}://${DBConfig.host}:${DBConfig.port}`;
}

logger.log(`DB 접속: ${url}`);
const client = new MongoClient(url);

try{
  await client.connect();
  logger.info(`DB 접속 성공: ${url}`);
  db = client.db(DBConfig.database);
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

  await codeUtil.initCode(db);

  await codeUtil.initConfig(db);

}catch(err){
  logger.error(err);
}

export const getDB = () => db;

export const getClient = () => client;

export const nextSeq = async _id => {
  let result = await db.seq.findOneAndUpdate({ _id }, { $inc: { no: 1 } });
  if(!result){
    result = { _id, no: 1 };
    await db.seq.insertOne({ _id, no: 2});
  }
  return result.no;
}

export default db;