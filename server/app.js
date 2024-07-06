import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' assert {type: 'json'};
import logger from './utils/logger.js';
import indexRouter from './routes/index.js';
import timer from 'node:timers/promises';
import config from './config/index.js';

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

app.use(
  // '/api',
  async function (req, res, next) {
    if (req.query.delay) {
      await timer.setTimeout(req.query.delay);
    }
    next();
  },
  indexRouter
);

// 404 에러
app.use(function(req, res, next){
  const err = new Error(`${req.url} 리소스를 찾을 수 없습니다.`);
  err.status = 404;
  next(err);
});

// 500 에러
app.use(function(err, req, res, next){
  logger.error(err.status === 404 ? err.message : err.stack+'\n\n');
  if(err.cause){
    logger.error(err.cause);
  }

  const status = err.cause?.status || err.status || 500;

  let message = status === 500 ? '요청하신 작업 처리에 실패했습니다. 잠시 후 다시 이용해 주시기 바랍니다.' : err.message;

  res.status(status);
  let result = { ok: 0, message };
  if(status === 401 || status === 422){
    result = { ...result, ...err };  
  }
  res.json(result);
});

export default app;
