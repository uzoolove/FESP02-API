import { io, Socket } from 'socket.io-client';

// 서버에서 클라이언트로 보낼 이벤트 정의
interface ServerToClientEvents {
  // 채팅방 생성/삭제시
  setRooms: (data: RoomsData) => void;
  // 채팅 메세지 전달시
  setMsg: (data: MsgItem) => void;
  // 채팅방 멤버 목록 변경시
  setMembers: (data: MembersData) => void;
}

// 클라이언트가 서버로 보낼 이벤트 정의
interface ClientToServerEvents {
  // 채팅방 목록 조회
  getRooms: (callback: (rooms: RoomsData) => void) => void;
  // 채팅방 멤버 조회
  getMembers: (roomId: string, callback: (members: MembersData) => void) => void;
  // 채팅방 정보 조회
  getRoomInfo: (roomId: string, callback: (roomInfo: RoomItem) => void) => void;
  // 채팅방 생성
  createRoom: (room: { user_id: number, hostName: string, roomName: string }) => void;
  // 채팅방 입장
  joinRoom: (room: { roomId: string, user_id: number | undefined; nickName: string | undefined }, callback: () => void) => void;
  // 채팅 메세지 전송
  sendMsg: (msg: string) => void;
  // 채팅방 퇴장
  leaveRoom: (callback: () => void) => void;
}


export interface InterServerEvents {
  ping: () => void;
}

// 채팅방 정보
export interface RoomItem {
  user_id: string;
  hostName: string;
  roomName: string;
}

// 채팅방 목록
export interface RoomsData {
  [roomId: string]: RoomItem;
}

// 채팅방 멤버 정보
interface MemberItem {
  user_id: string;
  nickName: string;
}

// 채팅방 멤버 목록
export interface MembersData {
  [socketId: string]: MemberItem;
}

// 채팅 메세지 정보
export interface MsgItem {
  nickName: string;
  msg: string;
}

const URL = import.meta.env.VITE_WEBSOCKET_SERVER + import.meta.env.VITE_WEBSOCKET_SERVER_NAMESPACE;
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false
});

