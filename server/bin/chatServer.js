import logger from '../utils/logger.js';
import shortid from "shortid";

const server = io => {
  logger.trace('socketServer start');
  const getRooms = () => Object.fromEntries(io.roomList || []);

  const getMembers = roomId => Object.fromEntries(io.roomList?.get(roomId)?.memberList || []);

  const getRoomInfo = roomId => io.roomList?.get(roomId) || {};

  const sendMsg = (socket, sender, msg) => {
    socket.nsp.to(socket.roomId).emit('setMsg', { nickName: sender, msg });
  };

  const joinRoom = (socket, { roomId, user_id, nickName }, success) => {
    logger.trace(roomId, user_id, nickName);
    if(io.roomList?.get(roomId)){
      const memberList = io.roomList.get(roomId).memberList;
      socket.roomId = roomId;
      socket.user_id = user_id;
      socket.nickName = nickName || '게스트' + (memberList.size + 1);
      memberList.set(socket.id, { user_id, nickName: socket.nickName });

      socket.join(roomId);

      sendMsg(socket, '시스템', `${socket.nickName}님이 입장했습니다.`);
      socket.nsp.to(roomId).emit('setMembers', getMembers(roomId));
      
      success && success();
    }else{
      socket.emit('setMsg', { nickName: '시스템', msg: `채팅방이 존재하지 않습니다.` });
      socket.disconnect();
    }
  };

  const leaveRoom = (socket, success) => {
    if(io.roomList?.get(socket.roomId)){
      io.roomList?.get(socket.roomId)?.memberList?.delete(socket.id);
      sendMsg(socket, '시스템', `${socket.nickName}님이 퇴장했습니다.`);
      socket.leave(socket.roomId);
      socket.nsp.to(socket.roomId).emit('setMembers', getMembers(socket.roomId));
      success && success();
    }else{
      socket.emit('setMsg', { nickName: '시스템', msg: `채팅방이 존재하지 않습니다.` });
      socket.disconnect();
    }
  };

  io.of('/00-next-level').on('connection', function(socket){
    logger.debug('클라이언트 접속', socket.id);
    // 클라이언트 접속 종료시
    socket.on('disconnect', function(){
      leaveRoom(socket);
    });

    // 채팅방 정보 반환
    socket.on('getRoomInfo', (roomId, callback) => callback(getRoomInfo(roomId)));

    // 생성된 모든 룸의 목록 반환
    socket.on('getRooms', callback => callback(getRooms()));

    // 지정한 룸에 참여한 모든 멤버 목록 반환
    // socket.on('getMembers', (roomId, callback) => callback(getMembers(roomId)));

    // 룸 생성
    socket.on("createRoom", function ({ user_id, hostName, roomName, parents_option }) {
        const roomId = shortid.generate();
        io.roomList = io.roomList || new Map();
        io.roomList.set(roomId, {
          user_id,
          hostName,
          roomName,
          parents_option,
          memberList: new Map(),
        });

        // joinRoom(socket, { roomId, user_id, nickName: hostName });

        socket.nsp.emit("setRooms", getRooms());

        // 클라이언트에게 'createRoomResponse' 이벤트를 발생시키고, 채팅방 정보를 보냄
        socket.emit("createRoomResponse", {
          success: true,
          roomList: getRooms(),
        });

        // callback({
        //   success: true,
        //   roomList: getRooms(),
        // });
        // console.log(user_id, hostName, roomName, parents_option, callback);
      }
    );


    // 룸에 참여
    socket.on('joinRoom', (props, success) => {
      joinRoom(socket, props, success);
    });

    // 룸에서 나가기
    socket.on('leaveRoom', success => {
      leaveRoom(socket, success);
    });

    // 클라이언트로부터 채팅 메세지 전송
    socket.on('sendMsg', msg => {
      sendMsg(socket, socket.nickName, msg);
    });
  });
};

export default server;