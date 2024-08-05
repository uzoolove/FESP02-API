/* eslint-disable no-unused-vars */

import moment from 'moment';

function getDay(day = 0) {
  return moment().add(day, 'days').format('YYYY.MM.DD');
}
function getTime(day = 0, second = 0) {
  return moment().add(day, 'days').add(second, 'seconds').format('YYYY.MM.DD HH:mm:ss');
}

export const initData = async (clientId, nextSeq) => {
  return {
    // 회원
    user: [
      {
        _id: await nextSeq('user'),
        email: 'admin@market.com',
        password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
        name: '무지',
        type: 'admin',
        image: `/files/${clientId}/user-muzi.webp`,
        createdAt: getTime(-100, -60 * 60 * 3),
        updatedAt: getTime(-100, -60 * 60 * 3),
      },
      {
        _id: await nextSeq('user'),
        email: 's1@market.com',
        password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
        name: '네오',
        type: 'seller',
        image: `/files/${clientId}/user-neo.webp`,
        createdAt: getTime(-50),
        updatedAt: getTime(-30, -60 * 60 * 3),
      },
      {
        _id: await nextSeq('user'),
        email: 'u1@market.com',
        password: '$2b$10$S.8GNMDyvUF0xzujPtHBu.j5gtS19.OhRmYbpJBnCHg2S83WLx1T2',
        name: '어피치',
        type: 'user',
        createdAt: getTime(-40, -60 * 30),
        updatedAt: getTime(-30, -60 * 20),
      },
    ],
    // 상품
    product: [
      
    ],
    // 주문
    order: [
      
    ],
    // 후기
    reply: [
      
    ],
    // 장바구니
    cart: [
      
    ],
    // 즐겨찾기/북마크
    bookmark: [
      
    ],
    // QnA, 공지사항, 게시판
    post: [
      {
        _id: await nextSeq('post'),
        type: 'info',
        title: '정보 게시판 사용안내.',
        views: 5,
        user: {
          _id: 1,
          name: '무지',
          image: `/files/${clientId}/user-muzi.webp`,
        },
        content: '좋은 정보 많이 공유해 주세요.',
        replies: [
          {
            _id: 1,
            user_id: 2,
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },
            content: '1등',
            like: 5,
            createdAt: getTime(-2, -60 * 60 * 20),
            updatedAt: getTime(-2, -60 * 60 * 2),
          },
          {
            _id: 2,
            user_id: 3,
            user: {
              _id: 3,
              name: '어피치'
            },
            content: '넵',
            like: 7,
            createdAt: getTime(-2, -60 * 60 * 10),
            updatedAt: getTime(-2, -60 * 60 * 1),
          }
        ],
        createdAt: getTime(-3, -60 * 60 * 2),
        updatedAt: getTime(-3, -60 * 60 * 2),
      },
      {
        _id: await nextSeq('post'),
        type: 'music',
        title: '일일 DJ, GD 입니다',
        views: 5,
        user: {
          _id: 2,
          name: '네오',
          image: `/files/${clientId}/user-neo.webp`
        },
        content: '좋은 노래 많이 신청해 주세요.',
        replies: [
          {
            _id: 1,
            user_id: 2,
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },
            like: 5,
            content: '삐딱하게 틀어주세요',
            videoId: 'RKhsHGfrFmY',
            extra: {
              artist: 'GD',
              title: 'G-DRAGON - 삐딱하게(CROOKED) M/V',
            },            
            createdAt: getTime(-2, -60 * 60 * 20),
            updatedAt: getTime(-2, -60 * 60 * 2),
          },
          {
            _id: 2,
            user_id: 3,
            user: {
              _id: 3,
              name: '어피치'
            },
            content: '비가오니까 에픽하이의 우산이 듣고 싶어요.',
            like: 13,
            videoId: 'NIPtyAKxlRs',
            extra: {
              artist: '에픽하이',
              title: '에픽하이(Epik high) - 우산 (Feat. 윤하)',
            },
            createdAt: getTime(-2, -60 * 60 * 10),
            updatedAt: getTime(-2, -60 * 60 * 1),
          }
        ],
        createdAt: getTime(-3, -60 * 60 * 2),
        updatedAt: getTime(-3, -60 * 60 * 2),
      }
    ],
    // 코드
    code: [
      {
        _id: 'activePost',
        title: '활성 게시판',
        codes: [
          {
            sort: 2,
            code: 'AP01',
            value: '문의 게시판',
            active: false, // 활성 여부
          },
          {
            sort: 1,
            code: 'AP02',
            value: '정보 공유', // 게시판 이름
            active: true,
          },
          {
            sort: 3,
            code: 'AP03',
            value: '음악 신청',
            active: true,
          },
        ],
      },
    ],
    // 설정
    config: [
      {
        _id: 'shippingFees',
        title: '배송비',
        value: 3500,
      },
      {
        _id: 'freeShippingFees',
        title: '배송비 무료 금액',
        value: 50000,
      },
    ],
  }
};