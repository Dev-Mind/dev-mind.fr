const express = require('express');
const http2 = require('http2');
const http = require('http');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const cachePolicy = require('./app.webcache');
const security = require('./app.security');
const session = require('express-session');

const parseJsonEnv = (value) => {
  const fields = value.replace("{", "").replace("}", "").replace("[", "").replace("]", "").trim().split(",")
  const users = [];
  for (let i = 0; i < fields.length; i = i + 2) {
    users.push({username: fields[0].split(":")[1].trim(), password: fields[1].split(":")[1].trim()});
  }
  return users
};

const DEVMIND = {
  static: 'build/dist',
  port: process.env.PORT || 8081,
  secret: process.env.DEVMIND_SESSION_SECRET || 'SMHQs7cLAC3x',
  http2: process.env.DEVMIND_HTTP2,
  securedUrls: ['/training/'],
  users: process.env.DEVMIND_USERS ? parseJsonEnv(process.env.DEVMIND_USERS) : [{
    username: 'guillaume',
    password: '5f4dcc3b5aa765d61d8327deb882cf99'
  }]
};

const app = express()
  .use(session(security.sessionAttributes(DEVMIND.secret)))
  .use(compression())
  .use(express.urlencoded({extended: false}))
  .use(helmet())
  //.use(helmet.contentSecurityPolicy(security.securityPolicy()))
  .use(security.checkAuth(DEVMIND.securedUrls))
  .use(express.static(DEVMIND.static, {setHeaders: cachePolicy.setCustomCacheControl}))
  .get('/logout', security.logoutHandler())
  .post('/login', security.loginHandler(DEVMIND.users))
  .all('*', security.notFoundHandler());

app.set('port', DEVMIND.port);

const HTTPS_CONFIG = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
};

if(DEVMIND.http2){
  http2.createSecureServer(HTTPS_CONFIG)
       .listen(DEVMIND.port)
       .on('error', onError)
       .on('listening', () => {
         console.debug(`Listening on ${DEVMIND.port}`);
         console.debug(`Environnement ${process.env.NODE_ENV}`);
         console.debug(`Users ${DEVMIND.users.map(u => u.username)}`);
         console.debug('Mode HTTP2');
       });
}
else{
  http.Server(app)
      .listen(DEVMIND.port)
      .on('error', onError)
      .on('listening', () => {
        console.debug('Listening on ' + DEVMIND.port);
        console.debug(`Environnement ${process.env.NODE_ENV}`);
        console.debug(`Users ${DEVMIND.users.map(u => u.username)}`);
        console.debug('Mode HTTP');
      });
}

function onError(error) {
  console.error(error);
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

