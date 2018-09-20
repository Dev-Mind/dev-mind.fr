const express = require('express');
const http = require('http2');
const compression = require('compression');
const serveStatic = require('serve-static');
const helmet = require('helmet');
const cachePolicy = require('./app.webcache');
const security = require('./app.security');
const session = require('express-session');

const DEVMIND = {
  static: 'build/dist',
  port: process.env.PORT || 3302,
  secret: process.env.DEVMIND_SESSION_SECRET || 'SMHQs7cLAC3x',
  securedUrls: ['/training/'],
  users : process.env.DEVMIND_USERS || [{username: 'guillaume', password: '5f4dcc3b5aa765d61d8327deb882cf99'}]
};



const app = express()
  .use(session(security.sessionAttributes(DEVMIND.secret)))
  .use(compression())
  .use(express.urlencoded())
  .use(helmet())
  .use(helmet.contentSecurityPolicy(security.securityPolicy()))
  .use(security.checkAuth(DEVMIND.securedUrls))
  .use(express.static(DEVMIND.static, { setHeaders: cachePolicy.setCustomCacheControl }))
  .get('/logout', security.logoutHandler())
  .post('/login', security.loginHandler(DEVMIND.users))
  .all('*', security.notFoundHandler())
  .listen(DEVMIND.port, () => console.log(`Webapp started and listening on port ${DEVMIND.port}!`))

http.createServer(app);