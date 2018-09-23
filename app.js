const express = require('express');
const http = require('http');
const compression = require('compression');
const helmet = require('helmet');
const cachePolicy = require('./app.webcache');
const security = require('./app.security');
const session = require('express-session');

const DEVMIND = {
  static: 'build/dist',
  port: process.env.PORT || 8080,
  secret: process.env.DEVMIND_SESSION_SECRET || 'SMHQs7cLAC3x',
  securedUrls: ['/training/'],
  users : process.env.DEVMIND_USERS ? JSON.stringify(process.env.DEVMIND_USERS) : [{username: 'guillaume', password: '5f4dcc3b5aa765d61d8327deb882cf99'}]
};

console.log('config', DEVMIND);


const app = express()
  .use(session(security.sessionAttributes(DEVMIND.secret)))
  .use(compression())
  .use(express.urlencoded({ extended: false }))
  .use(helmet())
  //.use(helmet.contentSecurityPolicy(security.securityPolicy()))
  .use(security.checkAuth(DEVMIND.securedUrls))
  .use(express.static(DEVMIND.static, { setHeaders: cachePolicy.setCustomCacheControl }))
  .get('/logout', security.logoutHandler())
  .post('/login', security.loginHandler(DEVMIND.users))
  .all('*', security.notFoundHandler());

app.set('port', DEVMIND.port);

http.Server(app)
    .listen(DEVMIND.port)
    .on('error', onError)
    .on('listening', () => console.debug('Listening on ' + DEVMIND.port));


function onError(error) {
  console.error("Unxpected error " + error.syscall)
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EADDRINUSE':
      console.error('Port is already in use : ' + DEVMIND.port);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

