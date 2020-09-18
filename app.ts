import {Express, ServerOptions} from './src/main/server/express';
import * as http from 'http';

const options = {
  static: process.env.DEVMIND_SITE_PATH || `build/dist`,
  port: process.env.PORT || 8080,
  mongodb: {
    url: process.env.DEVMIND_MONGO_URL || 'mongodb://localhost:27017/devminddb',
    user: process.env.DEVMIND_MONGO_USER || 'devmind',
    password: process.env.DEVMIND_MONGO_PASSWORD || 'pass'
  },
  mail: {
    host: process.env.DEVMIND_MAIL_HOST || 'ssl0.ovh.net',
    port: process.env.DEVMIND_MAIL_PORT ? parseInt(process.env.DEVMIND_MAIL_PORT) : 465,
    secure: true,
    user: process.env.DEVMIND_MAIL_USER,
    password: process.env.DEVMIND_MAIL_PASSWORD
  },
  securedUrls: [
    {url: '/users', right: 'ADMIN'},
    {url: '/statistics', right: 'ADMIN'}
  ],
  secret: process.env.DEVMIND_SESSION_SECRET || 'SMHQs7cLAC3x'
} as ServerOptions;

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
