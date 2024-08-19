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
    product: [],
    // 주문
    order: [],
    // 후기
    reply: [],
    // 장바구니
    cart: [],
    // 즐겨찾기/북마크
    bookmark: [],
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
            _id: await nextSeq('reply'),
            user_id: 2,
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`,
            },
            content: '1등',
            like: 5,
            createdAt: getTime(-2, -60 * 60 * 20),
            updatedAt: getTime(-2, -60 * 60 * 2),
          },
          {
            _id: await nextSeq('reply'),
            user_id: 3,
            user: {
              _id: 3,
              name: '어피치',
            },
            content: '넵',
            like: 7,
            createdAt: getTime(-2, -60 * 60 * 10),
            updatedAt: getTime(-2, -60 * 60 * 1),
          },
        ],
        createdAt: getTime(-3, -60 * 60 * 2),
        updatedAt: getTime(-3, -60 * 60 * 2),
      },
      {
        _id: await nextSeq('post'),
        type: 'music',
        title: '음악 신청 게시판 사용 방법입니다.',
        content: '안녕하세요.\r\n오늘 일일 DJ를 하게 된 용디입니다.\r\n\r\n누구나 DJ 게시글에 글을 등록하면 DJ가 될 수 있습니다.\r\n신청곡은 해당 게시글에 댓글로 요청하면 되고 등록한 순서대로 자동 재생이됩니다.\r\n사연도 같이 등록하면 자동으로 사연을 읽어주고 신청곡이 재생됩니다.\r\n\r\n재생할 신청곡이 없으면 DJ가 선곡한 곡이 순서대로 재생되고 한 곡 재생이 완료되면 새로운 신청곡을 체크해서 신청곡이 재생됩니다.',
        videoInfoList: [
          {
            _id: await nextSeq('reply'),
            videoId: 'E0C-tN9QJ3Q',
            extra: {
              title: '박혜경 - Rain (2002年)',
            },
            user: {
              _id: 3,
              name: '',
            },
            content: '',
          },
          {
            _id: await nextSeq('reply'),
            videoId: 'iSwxR-eO0QM',
            extra: {
              title: '이럴거면(가사) 아이비',
            },
            user: {
              _id: 3,
              name: '',
            },
            content: '',
          },
          {
            _id: await nextSeq('reply'),
            videoId: 'wq4HlLqYyRY',
            extra: {
              title: '헤이즈 (Heize) -  비가 오는 날엔 (2021) / 가사',
            },
            user: {
              _id: 3,
              name: '',
            },
            content: '',
          },
          {
            _id: await nextSeq('reply'),
            videoId: 'atz_aZA3rf0',
            extra: {
              title: 'Ne-Yo - Because Of You (Official Music Video)',
            },
            user: {
              _id: 3,
              name: '',
            },
            content: '',
          },
          {
            _id: await nextSeq('reply'),
            videoId: 'CGxUd7kjnuA',
            extra: {
              title: '허각 - 나를 잊지 말아요 [최고의 사랑 OST] [가사/Lyrics]',
            },
            user: {
              _id: 3,
              name: '',
            },
            content: '',
          },
        ],
        views: 318,
        user: {
          _id: 3,
          name: '어피치',
          image: '/files/00-next-level/user-apeach.webp',
        },
        createdAt: getTime(-3, -60 * 60 * 20),
        updatedAt: getTime(-2, -60 * 60 * 10),
        seller_id: null,
        replies: [
          {
            _id: await nextSeq('reply'),
            videoId: '4TWR90KJl84',
            content: '넥스트 레베루 프로젝트니까 next level 신청합니다.',
            extra: {
              title: "aespa 에스파 'Next Level' MV",
              thumbnail: 'https://i.ytimg.com/vi/4TWR90KJl84/default.jpg'
            },  
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },
            createdAt: getTime(-2, -60 * 60 * 20),
            updatedAt: getTime(-2, -60 * 60 * 2)
          },
          {
            _id: await nextSeq('reply'),
            videoId: '',
            content: '그냥 댓글만 남겨봅니다.',
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },            
            createdAt: getTime(-2, -60 * 60 * 20),
            updatedAt: getTime(-2, -60 * 60 * 20)
          },          
          {
            _id: await nextSeq('reply'),
            videoId: 'NIPtyAKxlRs',
            content: '오늘처럼 비가 오는 날엔 이 노래죠',
            extra: {
              title: '에픽하이(Epik high) - 우산 (Feat. 윤하)',
              thumbnail: 'https://i.ytimg.com/vi/NIPtyAKxlRs/default.jpg'
            },
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },            
            createdAt: getTime(-2, -60 * 60 * 13),
            updatedAt: getTime(-2, -60 * 60 * 13)
          },
          {
            _id: await nextSeq('reply'),
            videoId: 'RKhsHGfrFmY',
            content: '',
            extra: {
              title: 'G-DRAGON - 삐딱하게(CROOKED) M/V',
              thumbnail: 'https://i.ytimg.com/vi/RKhsHGfrFmY/default.jpg'
            },
            user: {
              _id: 2,
              name: '네오',
              image: `/files/${clientId}/user-neo.webp`
            },            
            createdAt: getTime(-2, -60 * 60 * 10),
            updatedAt: getTime(-2, -60 * 60 * 10)
          }
        ]
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