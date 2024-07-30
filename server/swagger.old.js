import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: '오픈마켓 API',
    description: '오픈마켓 API Server입니다.<br><a href="/">버전별 변경사항 확인</a>'
  },
  servers: [
    {
      url: 'http://localhost/api',
      description: '로컬 테스트'
    },
    {
      url: 'https://market-lion.koyeb.app/api',
      description: '운영 테스트'
    }
  ],
  tags: [
    {
      name: '회원',
      description: '회원 관리 기능',
    },
    {
      name: '상품',
      description: '상품 관리 기능',
    },
    {
      name: '구매',
      description: '구매 관리 기능',
    },
    {
      name: '구매 후기',
      description: '구매 후기 관리 기능',
    },
    {
      name: '파일',
      description: '파일 업로드',
    },
  ],
  components: {
    securitySchemes: {
      "Access Token": {
        type: 'http',
        scheme: 'bearer',
        in: 'header',
        bearerFormat: 'JWT'
      },
      "Refresh Token": {
        type: 'http',
        scheme: 'bearer',
        in: 'header',
        bearerFormat: 'JWT'
      }
    },
    '@schemas': {
      login: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: '이메일',
            example: 'swagger@market.com'
          },
          password: {
            type: 'string',
            description: '비밀번호',
            example: '12345678'
          }
        },
        required: ['email', 'password']
      },

      createUser: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: '이메일'
          },
          password: {
            type: 'string',
            description: '비밀번호'
          },
          name: {
            type: 'string',
            description: '이름'
          },
          type: {
            type: 'string',
            enum: ['user', 'seller'],
            description: '회원 구분(user: 일반 회원, seller: 판매 회원)'
          },
          phone: {
            type: 'string',
            description: '전화번호'
          },
          address: {
            type: 'string',
            description: '주소'
          },
          extra: {
            type: 'object',
            description: '추가 속성들 정의'
          },
        },
        required: ['email', 'password', 'name', 'type']
      },
      createCode: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: '코드 아이디'
          },
          title: {
            type: 'string',
            description: '코드명'
          },
          codes: {
            type: 'object',
            description: '코드값 배열'
          }
        },
        required: ['_id', 'title', 'codes']
      }
    },
    schemas: {
      Sample: {
        type: 'object',
        properties: {
          "a": {
            type: 'string',
            required: true,
            default: 'hello',
            description: 'With no swagger-autogen render...'
          }
        }

      },
      error401: {
        "ok": 0,
        "message": "{인증 실패 사유}",
        "errorName": "EmptyAuthorization | TokenExpiredError | JsonWebTokenError"
      },
      error403: {
        "ok": 0,
        "message": "아이디와 패스워드를 확인하시기 바랍니다."
      },
      error404: {
        "ok": 0,
        "message": "/api/xxx 리소스를 찾을 수 없습니다."
      },
      error409: {
        "ok": 0,
        "message": "이미 등록된 리소스입니다."
      },
      error422: {
        "ok": 0,
        "message": "잘못된 입력값이 있습니다.",
        "errors": [
          {
            "type": "field",
            "value": "swaggermarket.com",
            "msg": "이메일 형식에 맞지 않습니다.",
            "path": "email",
            "location": "body"
          }
        ]
      },
      error500: {
        "ok": 0,
        "message": "요청하신 작업 처리에 실패했습니다. 잠시 후 다시 이용해 주시기 바랍니다."
      },
      simpleOK: {
        "ok": 1
      },
      emailImpossable: {
        "ok": 1,
        "duplicate": true
      },
      emailPossible: {
        "ok": 1,
        "duplicate": false
      },
      loginRes: {
        "ok": 1,
        "item": {
          "_id": 5,
          "email": "swagger@market.com",
          "name": "스웨거",
          "type": "user",
          "phone": "01011112222",
          "address": "서울시 강남구 역삼동 123",
          "createdAt": "2023.11.21 16:25:54",
          "updatedAt": "2023.11.21 16:25:54",
          "token": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjUsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzAwNTUxNTcyLCJleHAiOjE3MDA1NTIxNzIsImlzcyI6IkZFU1AwMSJ9.TmYTk4w-iQYjPK172AkSuH7587XZPPoFARTdg-fFGgA",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDA1NTE1NzIsImV4cCI6MTcwMzE0MzU3MiwiaXNzIjoiRkVTUDAxIn0.FSUXGwl3M5xnKpc_gkzdQfJ1FT_9IzwhO_X0iLHzXcE"
          }
        }
      },
      accessTokenRes: {
        "ok": 1,
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjUsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzAwNTU1NjUzLCJleHAiOjE3MDA1NTYyNTMsImlzcyI6IkZFU1AwMSJ9.tBbQZLmwlg0y5juJ_TTkET1buZ4QFGf8RJ0G_IWIyns"
      },
      productCreate: {
        "price": 22000,
        "shippingFees": 3000,
        "show": true,
        "active": true,
        "name": "ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물",
        "mainImages": ["/uploads/sample-janngu.jpg"],
        "content": "<div class=\"product-detail\"><p>ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물 상세 설명</p></div>",
        "createdAt": "2023.10.12 12:34:56",
        "updatedAt": "2023.10.12 12:34:56",
        "extra": {
          "isNew": true,
          "isBest": true,
          "category": ["PC02", "PC0201"],
          "quantity": 600,
          "buyQuantity": 190,
          "order": 7
        }
      },
      productUpdate: {
        "price": 22000,
        "shippingFees": 3000,
        "show": true,
        "active": true,
        "name": "ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물",
        "mainImages": ["/uploads/sample-jjangu.jpg"],
        "content": "<div class=\"product-detail\"><p>ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물 상세 설명</p></div>",
        "extra.isNew": true
      },
      productCreateRes: {
        "ok": 1,
        "item": {
          "price": 22000,
          "shippingFees": 3000,
          "show": true,
          "active": true,
          "name": "ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물",
          "mainImages": [
            "/uploads/sample-janngu.jpg"
          ],
          "content": "<div class=\"product-detail\"><p>ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물 상세 설명</p></div>",
          "createdAt": "2023.11.22 07:26:35",
          "updatedAt": "2023.11.22 07:26:35",
          "extra": {
            "isNew": true,
            "isBest": true,
            "category": [
              "PC02",
              "PC0201"
            ],
            "quantity": 600,
            "buyQuantity": 190,
            "order": 7
          },
          "seller_id": 2,
          "_id": 15
        }
      },


      productListRes: {
        "ok": 1,
        "item": [
          {
            "_id": 12,
            "seller_id": 2,
            "price": 9000,
            "shippingFees": 3000,
            "show": true,
            "active": true,
            "name": "스키비디 토일렛 봉제 인형 (25cm-30cm) 시리즈 크리스마스 선물",
            "mainImages": [
              "/uploads/sample-skibidi11.jpg"
            ],
            "createdAt": "2023.11.10 07:07:41",
            "updatedAt": "2023.11.16 13:07:41",
            "extra": {
              "isNew": true,
              "isBest": true,
              "category": [
                "PC01",
                "PC0103"
              ],
              "quantity": 999,
              "buyQuantity": 230,
              "order": 7
            }
          }
        ]
      },
      productInfoRes: {
        "ok": 1,
        "item": {
          "_id": 4,
          "seller_id": 3,
          "price": 45000,
          "shippingFees": 3500,
          "show": true,
          "active": true,
          "name": "레고 테크닉 42151 부가티 볼리드",
          "mainImages": [
            "/uploads/sample-bugatti.png"
          ],
          "content": "\n        <div class=\"product-detail\">\n          <p>레고 테크닉 42151 부가티 볼리드 상세 설명</p>\n        </div>",
          "createdAt": "2023.10.19 12:07:41",
          "updatedAt": "2023.10.30 16:07:41",
          "extra": {
            "isNew": false,
            "isBest": true,
            "category": [
              "PC03",
              "PC0303"
            ],
            "quantity": 100,
            "buyQuantity": 30,
            "order": 1
          },
          "replies": [
            {
              "_id": 1,
              "rating": 5,
              "content": "아이가 좋아해요.",
              "createdAt": "2023.11.17 07:07:41",
              "userName": "제이지"
            },
            {
              "_id": 2,
              "rating": 4,
              "content": "배송이 좀 느려요.",
              "createdAt": "2023.11.18 18:07:41",
              "userName": "네오"
            }
          ]
        }
      },
      productUpdateRes: {
        "ok": 1,
        "updated": {
          "price": 22000,
          "shippingFees": 3000,
          "show": true,
          "active": true,
          "name": "ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물",
          "mainImages": [
            "/uploads/sample-jjangu.jpg"
          ],
          "content": "<div class=\"product-detail\"><p>ZOZOFO 테이블 게임 축구 보드 사커 게임기 보드게임 2인경기 완구 가족모임 미니 월드컵 스포츠 어린이 크리스마스 선물 생일 선물 상세 설명</p></div>",
          "extra.isNew": true,
          "updatedAt": "2023.11.22 08:30:59"
        }
      },


      orderCreate: {
        "products": [
          {
            "_id": 4,
            "quantity": 2
          }
        ],
        "address": {
          "name": "학교",
          "value": "서울시 강남구 역삼동 234"
        }
      },

      orderCreateRes: {
        "ok": 1,
        "item": {
          "products": [
            {
              "_id": 4,
              "quantity": 2,
              "name": "레고 테크닉 42151 부가티 볼리드",
              "image": "/uploads/sample-bugatti.png",
              "price": 90000
            }
          ],
          "address": {
            "name": "학교",
            "value": "서울시 강남구 역삼동 234"
          },
          "user_id": 2,
          "_id": 4,
          "createdAt": "2023.11.22 08:41:28",
          "cost": {
            "products": 205000,
            "shippingFees": 6000,
            "total": 211000
          }
        }
      },

      codeListRes: {
        "ok": 1,
        "item": {
          "productCategory": {
            "_id": "productCategory",
            "title": "상품 카테고리",
            "codes": [
              {
                "sort": 1,
                "code": "PC02",
                "value": "스포츠",
                "depth": 1
              }
            ]
          },
          "orderState": {
            "_id": "orderState",
            "title": "주문 상태",
            "codes": [
              {
                "sort": 1,
                "code": "OS010",
                "value": "주문 완료"
              }
            ]
          },
          "userLevel": {
            "_id": "userLevel",
            "title": "회원 등급",
            "codes": [
              {
                "sort": 1,
                "code": "UL01",
                "value": "일반"
              }
            ]
          }
        }
      },

      codeDetailRes: {
        "ok": 1,
        "item": {
          "productCategory": {
            "_id": "productCategory",
            "title": "상품 카테고리",
            "codes": [
              {
                "sort": 2,
                "code": "PC01",
                "value": "어린이",
                "depth": 1,
              }
            ],
            "nestedCodes": [
              {
                "sort": 2,
                "code": "PC01",
                "value": "어린이",
                "depth": 1,
                "sub": [
                  {
                    "sort": 1,
                    "code": "PC0102",
                    "value": "보드게임",
                    "parent": "PC01",
                    "depth": 2,
                    "sub": [
                      {
                        "sort": 1,
                        "code": "PC010202",
                        "value": "3~4인용",
                        "parent": "PC0102",
                        "depth": 3
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }

    },

    examples: {
      singleFileUploadRes: {
        "ok": 1,
        "file": {
          "name": "Cmw0AOtWf.jpg",
          "path": "/uploads/Cmw0AOtWf.jpg"
        }
      },
      fileUploadFieldError: {
        "ok": 0,
        "message": "첨부 파일 필드명은 attach로 지정해야 합니다."
      },
      fileUploadLimitError: {
        "ok": 0,
        "message": "파일은 한번에 10개 까지만 업로드가 가능합니다."
      },
      multiFileUploadRes: {
        "ok": 1,
        "files": [
          {
            "originalname": "sample-cat.jpg",
            "name": "nQYGBCVZZ.jpg",
            "path": "/uploads/nQYGBCVZZ.jpg"
          },
          {
            "originalname": "sample-dog.jpg",
            "name": "Gb4OJkEX2k.jpg",
            "path": "/uploads/Gb4OJkEX2k.jpg"
          }
        ]
      },
      createUserLevelCode: {
        "_id": "userLevel",
        "title": "회원 등급",
        "codes": [
          {
            "sort": 1,
            "code": "UL01",
            "value": "일반"
          }, {
            "sort": 2,
            "code": "UL02",
            "value": "프리미엄"
          }, {
            "sort": 3,
            "code": "UL03",
            "value": "VIP"
          }
        ]
      },
      updateUserLevelCode: {
        "title": "회원 등급",
        "codes": [
          {
            "sort": 1,
            "code": "UL01",
            "value": "일반"
          }, {
            "sort": 2,
            "code": "UL02",
            "value": "프리미엄"
          }, {
            "sort": 3,
            "code": "UL03",
            "value": "VIP"
          }, {
            "sort": 4,
            "code": "UL04",
            "value": "VVIP"
          }
        ]
      },
      updateUserLevelCodeRes: {
        "_id": "userLevel",
        "title": "회원 등급",
        "codes": [
          {
            "sort": 1,
            "code": "UL01",
            "value": "일반"
          }, {
            "sort": 2,
            "code": "UL02",
            "value": "프리미엄"
          }, {
            "sort": 3,
            "code": "UL03",
            "value": "VIP"
          }, {
            "sort": 4,
            "code": "UL04",
            "value": "VVIP"
          }
        ]
      },
      createCategoryCode: {
        "_id": "productCategory",
        "title": "상품 카테고리",
        "codes": [
          {
            "sort": 1,
            "code": "PC0102",
            "value": "보드게임",
            "parent": "PC01",
            "depth": 2
          },
          {
            "sort": 1,
            "code": "PC02",
            "value": "스포츠",
            "depth": 1
          },
          {
            "sort": 1,
            "code": "PC0201",
            "value": "축구",
            "parent": "PC02",
            "depth": 2
          },
          {
            "sort": 1,
            "code": "PC0301",
            "value": "원격 조종",
            "parent": "PC03",
            "depth": 2
          },
          {
            "sort": 2,
            "code": "PC01",
            "value": "어린이",
            "depth": 1
          },
          {
            "sort": 2,
            "code": "PC0103",
            "value": "레고",
            "parent": "PC01",
            "depth": 2
          },
          {
            "sort": 2,
            "code": "PC0203",
            "value": "농구",
            "parent": "PC02",
            "depth": 2
          },
          {
            "sort": 2,
            "code": "PC0302",
            "value": "퍼즐",
            "parent": "PC03",
            "depth": 2
          },
          {
            "sort": 3,
            "code": "PC0101",
            "value": "퍼즐",
            "parent": "PC01",
            "depth": 2
          },
          {
            "sort": 3,
            "code": "PC0202",
            "value": "야구",
            "parent": "PC02",
            "depth": 2
          },
          {
            "sort": 3,
            "code": "PC03",
            "value": "어른",
            "parent": "PC03",
            "depth": 1
          },
          {
            "sort": 3,
            "code": "PC0303",
            "value": "레고",
            "parent": "PC03",
            "depth": 2
          },
          {
            "sort": 4,
            "code": "PC0104",
            "value": "로봇",
            "parent": "PC01",
            "depth": 2
          }
        ]
      },

      createCodeRes: {
        "ok": 1,
        "item": {
          "_id": "userLevel",
          "title": "회원 등급",
          "codes": [
            {
              "sort": 1,
              "code": "UL01",
              "value": "일반"
            },
            {
              "sort": 2,
              "code": "UL02",
              "value": "프리미엄"
            },
            {
              "sort": 3,
              "code": "UL03",
              "value": "VIP"
            }
          ]
        }
      },

      createUser: {
        email: 'swagger@market.com',
        password: '12345678',
        name: '스웨거',
        type: 'user',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
      },

      createUserWithExtra: {
        email: 'swagger@market.com',
        password: '12345678',
        name: '스웨거',
        type: 'user',
        phone: '01011112222',
        address: '서울시 강남구 역삼동 123',
        extra: {
          gender: 'extra에는 프로젝트에서 필요한 아무 속성이나',
          age: '필요한 값을',
          address: ['넣으면', '됩니다.'],
          image: '/uploads/swagger.jpg',
          obj: {
            hello: '객체로',
            hi: '넣어도 됩니다.'
          },
          addressBook: [{
            name: '집',
            address: '서울시'
          }, {
            name: '회사',
            address: '인천시'
          }]
        }
      },

      createUserRes: {
        "ok": 1,
        "item": {
          "email": "swagger@market.com",
          "name": "스웨거",
          "type": "user",
          "phone": "01011112222",
          "address": "서울시 강남구 역삼동 123",
          "_id": 5,
          "createdAt": "2023.11.21 14:31:15",
          "updatedAt": "2023.11.21 14:31:15"
        }
      },

      createUserResWithExtra: {
        "ok": 1,
        "item": {
          "email": "swagger@market.com",
          "name": "스웨거",
          "type": "user",
          "phone": "01011112222",
          "address": "서울시 강남구 역삼동 123",
          "extra": {
            "gender": "extra에는 프로젝트에서 필요한 아무 속성이나",
            "age": "필요한 값을",
            "address": [
              "넣으면",
              "됩니다."
            ],
            "image": "/uploads/swagger.jpg",
            "obj": {
              "hello": "객체로",
              "hi": "넣어도 됩니다."
            },
            "addressBook": [
              {
                "name": "집",
                "address": "서울시"
              },
              {
                "name": "회사",
                "address": "인천시"
              }
            ]
          },
          "_id": 5,
          "createdAt": "2023.11.21 14:33:41",
          "updatedAt": "2023.11.21 14:33:41"
        }
      },

      userInfoResOneAttr: {
        "ok": 1,
        "item": {
          "name": "스웨거"
        }
      },

      userInfoResWithExtra: {
        "ok": 1,
        "item": {
          "extra": {
            "addressBook": [
              {
                "name": "집",
                "address": "서울시"
              },
              {
                "name": "회사",
                "address": "인천시"
              }
            ]
          }
        }
      },

      updateUserOneAttr: {
        "phone": "01099998888",
        "name": "스웨거2"
      },

      updateUserResOneAttr: {
        "ok": 1,
        "updated": {
          "name": "스웨거2",
          "phone": "01099998888",
          "updatedAt": "2023.11.21 20:16:53"
        }
      },

      updateUserWithExtra: {
        "extra": {
          "address": [
            {
              "id": 1,
              "name": "회사",
              "value": "서울시 강남구 삼성동 111"
            },
            {
              "id": 2,
              "name": "학교",
              "value": "서울시 강남구 역삼동 222"
            }
          ]
        }
      },

      updateUserResWithExtra: {
        "ok": 1,
        "updated": {
          "extra": {
            "address": [
              {
                "id": 1,
                "name": "회사",
                "value": "서울시 강남구 삼성동 111"
              },
              {
                "id": 2,
                "name": "학교",
                "value": "서울시 강남구 역삼동 222"
              }
            ]
          },
          "updatedAt": "2023.11.21 20:13:33"
        }
      },


    }
  }
}


const outputFile = './swagger-output.json';
const routes = ['./routes/user/index.js', './routes/seller/index.js', './routes/admin/index.js'];


const options = {
  openapi: '3.0.0',
  language: 'ko-KR',
};

swaggerAutogen(options)(outputFile, routes, doc);