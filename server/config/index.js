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
  protocol: process.env.DB_PROTOCOL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  clientIds: ['00-ins'],
  // clientIds: ['00-sample', '01-Trip-with-me', '02-Shimm', '03-OGC', '04-makeAcake', '05-cagong', '06-haemeogeo', '07-WeatherMate', '08-bbangradise', '09-chuno'],
};

export const jwt = {
  access: {
    secretKey: 'ShoppingAccessToken', // 암호키
    options: {
      algorithm: 'HS256', // 대칭키 방식
      expiresIn: '2h',  // 2시간
      // expiresIn: '10m', // 10분
      // expiresIn: '10s',  // 10초
      issuer: 'FESP01', // 발행자
    },
  },
  refresh: {
    secretKey: 'ShoppingRefreshToken',
    options: {
      algorithm: 'HS256',
      expiresIn: '30d',
      // expiresIn: '30s',
      issuer: 'FESP01', 
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