import { socket, type MsgItem, RoomItem, MembersData } from '../../utils/websocket';
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userState } from '../../recoil/user/atoms';
import { useParams } from 'react-router';


const ChatRoom = function(){
  // 서버 접속 상태
  const [isJoined, setIsJoined] = useState(false);
  // 채팅방 멤버 목록
  const [members, setMembers] = useState<MembersData>({});
  // 채팅 메세지 목록
  const [msgList, setMsgList] = useState<string[]>([]);
  // 채팅방 정보
  const [roomInfo, setRoomInfo] = useState<Partial<RoomItem>>({});

  const { roomId } = useParams();

  const user = useRecoilValue(userState);

  // 서버 접속 완료시
  const onConnect = () => {
    socket.emit('getRoomInfo', roomId!, setRoomInfo);
    socket.emit('getMembers', roomId!, setMembers);
  };

  // 채팅방 입장
  const handleJoinRoom = () => {
    socket.emit('joinRoom', { roomId: roomId!, user_id: user?._id, nickName: user?.name }, () => {
      setIsJoined(true);
    });
  };

  // 채팅방 퇴장
  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', () => {
      setIsJoined(false);
    });
  };

  useEffect(() => {
    const onDisconnect = () => {
      setIsJoined(false);
    }

    const onSetMsg = (data: MsgItem) => {
      setMsgList(previous => [...previous, `${data.nickName}: ${data.msg}`]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('setMsg', onSetMsg);
    socket.on('setMembers', setMembers);

    if(socket.connected){
      onConnect();
    }else{
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('setMsg', onSetMsg);
      socket.off('setMembers', setMembers);
    };
  }, []);


  const msgOut = React.createRef<HTMLDivElement>();

  // msgOut이 업데이트될 때마다 맨 아래로 스크롤
  useEffect(() => {
    if(msgOut.current) {
      msgOut.current.scrollTop = msgOut.current.scrollHeight;
    }
  }, [msgOut]);

  const [msg, setMsg] = useState('');
  const inputRef = React.createRef<HTMLInputElement>();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    sendMsg(msg);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if(event.key === 'Enter'){
      sendMsg(msg);
    }
  }

  function sendMsg(msg: string){
    msg = msg.trim();
    if(msg){
      socket.emit('sendMsg', msg);
      if(inputRef.current){
        setMsg('');
        inputRef.current.focus();
      }
    }
  }



  return (
    <main>
      <div>
        <p>채팅방 제목: {roomInfo.roomName}</p>
        <p>개설자: {roomInfo.hostName}</p>
        <p>채팅방 링크: {window.location.origin}/chat/{roomId}</p>

        { isJoined &&
          <>
            <h3>참가자 목록</h3>
            <ul>
              {
                Object.keys(members).map((socketId, index) =>
                  <li key={ index }>{ members[socketId].nickName }</li>
                )
              }
            </ul>
          </>
        }
        
        <button onClick={ handleJoinRoom } disabled={ isJoined }>입장</button>
        <button onClick={ handleLeaveRoom } disabled={ !isJoined }>퇴장</button>

        <h3>채팅 메세지</h3>
        <div ref={msgOut} style={{maxHeight: '200px', overflowY: 'auto'}}>
          <ul>
            {
              msgList.map((msg, index) =>
                <li key={ index }>{ msg }</li>
              )
            }
          </ul>
        </div>
        
        { isJoined &&
          <>
            <div>
              <input type="text" size={40} disabled={ !isJoined } autoFocus={true} ref={inputRef} onChange={ e => setMsg(e.target.value) } onKeyDown={handleKeyDown} value={msg} />
              <button type="button" disabled={ !isJoined } onClick={ handleClick }>메세지 전송</button>
            </div>
          </>
        }
      </div>
    </main>
  );
};

export default ChatRoom;