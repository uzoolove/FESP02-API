import { atom } from 'recoil';
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: 'code',
  storage: localStorage,
});

export interface BaseCodeItemType {
  code: string;
  value: string;
  sort: number;
}

export interface CategoryCodeItemType extends BaseCodeItemType{
  depth: number;
  sub?: CategoryCodeItemType[];
  parent?: string;
}

export interface MembershipCodeItemType extends BaseCodeItemType{
  discountRate: number;
}

export type CodeItemType = BaseCodeItemType | MembershipCodeItemType | CategoryCodeItemType;

export interface CodeType {
  _id: string;
  title: string;
  codes: CodeItemType[];
}

// export interface CategoryCodeType extends CodeType {
//   depth: number;
//   sub?: CategoryCodeItemType[];
//   parent?: string;
// }

export interface CodeListType {
  nested: {
    productCategory: CodeType;
    orderState: CodeType;
    membershipClass: CodeType;
  };
  flatten: {
    [code: string]: CodeItemType;
  }
}

export const codeState = atom<CodeListType | null>({
  key: 'codeState',
  default: null,
  effects: [persistAtom]
});