const express = require('express');
const http = require('http');
const compression = require('compression');
const helmet = require('helmet');
const cachePolicy = require('./server/app.webcache');
const security = require('./server/app.security');
const session = require('express-session');
const mongodb = require('mongodb');

const parseJsonEnv = (value) => {
  const valueWithoutSpace = value.replace(/[ ]/g, '');
  const userBlock = valueWithoutSpace.split("},{");

  const users = [];
  for (let i = 0; i < userBlock.length; i++) {
    const userBlockSantizied = userBlock[i].replace(/[\[{}\]]/g, '').split(",");
    users.push({username: userBlockSantizied[0].split(':')[1], password: userBlockSantizied[1].split(':')[1]});
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
  }],
  mongodb: {
    url: 'mongodb://localhost:27017/mydb',
    options: {}
  }
};

// The mongodb pool connection is initialized
const mongoClient = mongodb.MongoClient;
mongoClient.connect(DEVMIND.mongodb.url,DEVMIND.mongodb.options, function(err, database) {
  if(err) throw err;

  db = database;

  // Start the application after the database connection is ready
  const app = express()
    .enable('trust proxy')
    .use(security.rewrite())
    .use(session(security.sessionAttributes(DEVMIND.secret)))
    .use(compression())
    .use(express.urlencoded({extended: false}))
    .use(helmet())
    //.use(helmet.contentSecurityPolicy(security.securityPolicy()))
    .use(security.checkAuth(DEVMIND.securedUrls))
    .use(security.corsPolicy())
    .use(express.static(DEVMIND.static, {setHeaders: cachePolicy.setCustomCacheControl}))
    .get('/stats', visitHandler())
    .get('/logout', security.logoutHandler())
    .post('/login', security.loginHandler(DEVMIND.users))
    .all('*', security.notFoundHandler());


  app.set('port', DEVMIND.port);

  http.Server(app)
      .listen(DEVMIND.port)
      .on('error', onError)
      .on('listening', () => {
        console.debug('Listening on ' + DEVMIND.port);
        console.debug(`Environnement ${process.env.NODE_ENV}`);
        console.debug(`Users ${DEVMIND.users.map(u => u.username)}`);
      });

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
});

/**
 * Handler used to clean up a session after logout
 */
const visitHandler = () => {
  return (req, res) => {
    console.log('Test save stats');
    var mongoClient = mongodb.MongoClient;


    // mongoClient.connect('mongodb://ukm5p5yczugga3tnjiam:Sgt1nx5Q3cJUfbrNjqhm@b4nvkpu9sifrbi9-mongodb.services.clever-cloud.com:27017/b4nvkpu9sifrbi9', {
    //   auth: {
    //     user: 'ukm5p5yczugga3tnjiam',
    //     password: 'Sgt1nx5Q3cJUfbrNjqhm'
    //   }
    // }, (err, db) => {
    //   if(err) throw err;
    //
    //   console.log('Yo man');
    //   // var collection = db.collection('statistiques');
    //   // collection.insert({a:2}, function(err, docs) {
    //   //   collection.count(function(err, count) {
    //   //     console.log(format("count = %s", count));
    //   //   });
    //   // });
    //   //
    //   // // Locate all the entries using find
    //   // collection.find().toArray(function(err, results) {
    //   //   console.dir(results);
    //   //   // Let's close the db
    //   //   db.close();
    //   // });
    // });
    return res.redirect('/');
  };
};

