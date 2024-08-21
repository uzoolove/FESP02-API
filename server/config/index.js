import logger from '#utils/logger.js';
import dotenv from 'dotenv';

// 기본 .env 파일 로딩(package.json에서 로딩함)
dotenv.config({ path: '.env' });
// 환경별 .env 파일 로딩
logger.log('NODE_ENV', process.env.NODE_ENV);
if (process.env.NODE_ENV) {
  dotenv.config({ override: true, path: `.env.${process.env.NODE_ENV}` });
}

export const db = {
  url: process.env.DB_URL,
  clientIds: ['00-sample', '00-next-level', '01-TriFly', '02-genisisu', '03-Greeny', '04-Foomee', '05-ILB', '06-PickYourPotion', '07-myeonhakso', '08-highlightalk', '09-triots'],
};

export const jwt = {
  access: {
    secretKey: 'ShoppingAccessToken', // 암호키
    options: {
      algorithm: 'HS256', // 대칭키 방식
      expiresIn: '1d',  // 하루
      // expiresIn: '2h',  // 2시간
      // expiresIn: '10m', // 10분
      // expiresIn: '10s',  // 10초
      issuer: 'FESP', // 발행자
    },
  },
  refresh: {
    secretKey: 'ShoppingRefreshToken',
    options: {
      algorithm: 'HS256',
      expiresIn: '30d',
      // expiresIn: '30s',
      issuer: 'FESP', 
    },
  }
};

export const cors = {
  origin: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127.0.0.1/,
    /netlify.app$/,
    /vercel.app$/,
    /fesp.shop$/,
    /codepen.io$/,
    /stackblitz.com$/,
    /webcontainer.io$/,
    new RegExp(process.env.APP_HOST)
  ]
};

export default {db, jwt, cors};