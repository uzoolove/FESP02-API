import { atom } from 'recoil';
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: 'user',
  storage: localStorage,
});

export interface UserType {
  _id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: 'user' | 'seller' | 'admin';
  membershipClass: string;
}

export const userState = atom<UserType | null>({
  key: 'userState',
  default: null,
  effects: [persistAtom]
});