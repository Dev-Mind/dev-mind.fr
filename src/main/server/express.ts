import * as express from 'express';
import * as handlebars from 'express-handlebars';
import * as logger from 'morgan';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cookieParser from "cookie-parser";
import {Db, MongoClient, MongoClientOptions, MongoError} from "mongodb";
import {Context} from "./context";
import {User} from "./model/user";
import {IS_PROD, SecuredUrl} from "./service/security.service";
import {MailerConfig} from "./model/mailer.config";
import {MongoConfig} from "./model/mongo.config";
import errorHandler = require("errorhandler");

export interface ServerOptions {
  static: string;
  port: number;
  mongodb: MongoConfig,
  mail: MailerConfig;
  // URL to check for security
  securedUrls: Array<SecuredUrl>;
  // Used to initiliaze session
  secret: string;
}

export class Express {

  public app: express.Application;
  public appContext: Context;

  constructor(public options: ServerOptions) {

    const mongoOptions: MongoClientOptions = {
      auth: {
        user: this.options.mongodb.user,
        password: this.options.mongodb.password
      },
      autoReconnect: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    };


    //create expressjs application
    this.app = express();

    // Start the mongo db pool
    new MongoClient(this.options.mongodb.url, mongoOptions).connect((err: MongoError, client: MongoClient) => {
      if (err) {
        console.error(`Impossible to connect to mongodb url ${this.options.mongodb.url}`);
        throw err;
      }

      //configure application
      this.config(client.db());

      // Add entry point to init data for empty db
      this.initData(client);

      // 404 redirection
      //this.app.all('*', (req, res) => res.redirect(`/404.html`));

      this.app.set('port', this.options.port);
    });
  }

  /**
   * Configure application
   */
  public config(db: Db) {
  console.log('IS_PROD', IS_PROD || false)
    this.app
      .engine('handlebars', handlebars())
      .set('view engine', 'handlebars')
      .enable('view cache')
      .enable('trust proxy')
      .set('views', `${__dirname}/views/`)
      .use(cookieParser(this.options.secret))
      .use(compression())
      .use(express.urlencoded({extended: false}))
      .use(IS_PROD ? helmet() : helmet({ contentSecurityPolicy: false}))
      .use(logger('dev'));

    const router = express.Router();
    this.appContext = new Context(db, router, this.options.mail);

    this.appContext.loadRoutes();

    this.app
      .use(this.appContext.statisticService.visitTracker())
      .use(this.appContext.securityService.rewrite())
      .use(this.appContext.securityService.checkAuth(this.options.securedUrls))
      .use(this.appContext.securityService.corsPolicy())
      .use(router)
      .use(express.static(this.options.static, {setHeaders: this.appContext.cacheService.setCustomCacheControl}));

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Bootstrap the application.
   */
  public static bootstrap(options: ServerOptions): Express {
    console.log("Try to start server");
    return new Express(options);
  }


  private initData(client: MongoClient){
    // If db is empty we need to initialize it
    client.db().listCollections().hasNext().then(result => {
      if (!result) {
        console.log('First app use : collections are empty, a default user is inserted')
        const user: User = {
          firstname: 'Guillaume',
          lastname: 'devmind',
          email: 'guillaume@dev-mind.fr',
          rights: ['ADMIN', 'TRAINING']
        };
        this.appContext.userDao.upsert(user);
      }

    });
  }
}
