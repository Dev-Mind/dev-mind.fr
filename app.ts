import {Express} from './server/express';
import * as http from 'http';
import {SecuredUrl} from "./server/service/security";

const options = {
  static: `build/dist`,
  port: 8081,
  mongodb: {
    url: 'mongodb://localhost:27017/devminddb',
    user: 'devmind',
    password: 'pass'
  },
  //TODO
  mail: {
    host: process.env.DEVMIND_MAIL_HOST || 'ssl0.ovh.net',
    port: process.env.DEVMIND_MAIL_PORT || 465,
    secure: true,
    user: process.env.DEVMIND_MAIL_USER || 'guillaume@dev-mind.fr',
    password: process.env.DEVMIND_MAIL_PASSWORD
  },
  securedUrls: [
    {url: '/training', right: 'ADMIN'} as SecuredUrl,
    {url: '/users', right: 'TRAINING'} as SecuredUrl
  ],
  secret: process.env.DEVMIND_SESSION_SECRET || 'SMHQs7cLAC3x'
};

const server = Express.bootstrap(options).app;


http.createServer(server)

  //listen on provided ports
  .listen(options.port)

  //add error handler
  .on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    switch (error.code) {
      case "EACCES":
        console.error(`${options.port} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`${options.port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  })

  //start listening on port
  .on("listening", () => {
    console.debug('Listening on ' + options.port);
    console.debug(`Environnement ${process.env.NODE_ENV}`);
  });
