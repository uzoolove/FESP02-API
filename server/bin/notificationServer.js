import logger from '../utils/logger.js';
import { db as DBConfig } from '#config/index.js';
import { getDBModel } from '#middlewares/setModel.js';

const clients = new Map();
const listen = io => {
  DBConfig.clientIds.forEach(clientId => {
    io.of(`/${clientId}`).on('connection', function(socket){
      logger.debug('클라이언트 접속', clientId, socket.id);
  
      socket.on('setUserId', async (userId, callback) => {
        logger.debug('setUserId', clientId, userId);
        clients.set(`${clientId}/${userId}`, socket);
        const list = await getDBModel(clientId, 'notification').find({ userId: Number(userId) });
        sendMsg(clientId, userId, { list });
        callback();
      });
    });
  });
  
  // io.of('/00-next-level').on('disconnect', function(socket){
  //   logger.debug('클라이언트 접속 종료', socket.id);

  //   socket.on('setUserId', (userId, callback) => {
  //     logger.debug('setUserId', userId);
  //     clients.set(userId, socket);
  //     callback();
  //   });
  // });
};

const sendMsg = (clientId, userId, msg) => {
  const key = `${clientId}/${userId}`;
  const socket = clients.get(key);
  logger.debug('find', key, 'in', clients.keys(), ':', !!socket, msg);
  socket?.emit('notification', msg);
};

export default {
  listen, sendMsg
};