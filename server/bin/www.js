#!/usr/bin/env node

/**
 * Module dependencies.
 */

import http from 'node:http';

import app from '../app.js';
import logger from '../utils/logger.js';
import config from '#config/index.js';
import { Server }  from 'socket.io';
import chatServer from './chatServer.js';
import notificationServer from '#bin/notificationServer.js';

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.API_PORT || '80');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  logger.info(`API 서버 구동 완료. ${process.env.API_HOST}:${port}`);
}

// socket.io 서버 구동
const io = new Server(server, { cors: { origin: config.cors.origin } } );
chatServer(io);
notificationServer.listen(io);