import * as express from 'express';
import * as handlebars from 'express-handlebars';
import * as logger from 'morgan';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cookieParser from "cookie-parser";
import {Db, MongoClient, MongoClientOptions, MongoError} from "mongodb";
import {Context} from "./context";
import {User} from "./model/user";
import {MailerConfig} from "./service/mailer.service";
import {SecuredUrl} from "./service/security.service";
import errorHandler = require("errorhandler");

export interface ServerOptions {
  static: string;
  port: number;
  mongodb: {
    url: string,
    user: string,
    password: string;
  },
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
      useNewUrlParser: true
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
      this.app.all('*', (req, res) => res.redirect(`/404.html`));

      this.app.set('port', this.options.port);
    });
  }

  /**
   * Configure application
   */
  public config(db: Db) {
    this.app
      .engine('handlebars', handlebars())
      .set('view engine', 'handlebars')
      .enable('view cache')
      .enable('trust proxy')
      .set('views', `${__dirname}/views/`)
      .use(cookieParser(this.options.secret))
      .use(compression())
      .use(express.urlencoded({extended: false}))
      .use(helmet())
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

        const stats = {
          "2015/12_patterns_transition_agile" : 1,
          "2019/application_android_score" : 665,
          "2016/communication_et_neuroscience" : 372,
          "2019/comprendre_programation_android" : 27,
          "2017/creer_service_worker" : 334,
          "2018/do_your_blog_yourself" : 475,
          "2017/dotcss" : 94,
          "2017/ecrire_ses_scripts_gradle_en_kotlin" : 898,
          "2016/flexbox_layouts_faciles" : 204,
          "2015/formes_leadership" : 257,
          "2016/headlesss_testing" : 41,
          "2017/highcharts_stackedarea" : 301,
          "2017/http" : 49,
          "2018/installer_xps_ubuntu" : 294,
          "2017/internet" : 68,
          "2015/java8_et_les_lambda_stream" : 8,
          "2018/junit5_and_springboot" : 1126,
          "2019/kotlin_et_android" : 66,
          "2018/mockserver" : 352,
          "2018/mongo_full_text_index" : 92,
          "2016/ngeurope_angular2_unittest" : 11,
          "2016/ngeurope_angular_cli" : 32,
          "2016/ngeurope_keynote_misko_hevery" : 12,
          "2016/ngeurope_mobile_first_is_not_mobile_only" : 16,
          "2016/ngeurope_rendering_et_angular" : 18,
          "2016/ngeurope_rxjs_angular2" : 222,
          "2016/ngeurope_typescript_et_angular" : 29,
          "2017/nouveau_site_asciidoctor" : 1749,
          "2018/objectif_clever_cloud_js" : 113,
          "2016/pousser_message_slack_en_java" : 100,
          "2018/premiere_conference_au_togo" : 79,
          "2018/publish_maven_central" : 223,
          "2018/secret_de_la_motivation" : 177,
          "2017/service_worker" : 469,
          "2017/site_wassadou" : 51,
          "2018/slide_avec_revealjs_asciidoctor" : 487,
          "2016/sorganiser_pour_la_complexite" : 90,
          "2016/springboot_devtools" : 17,
          "2016/springboot_http2" : 57,
          "2016/springboot_kotlin" : 8,
          "2017/test_services-rest-springboot" : 812,
          "2018/utiliser_api_envoi_email" : 335,
          "2017/web" : 30,
          "2017/workboxjs" : 677
        };

        Object
          .entries(stats)
          .forEach((entry) =>
              this.appContext.uniquePageVisitDao.initVisit(`/blog/${entry[0]}.html`, entry[1]));
      }

    });
  }
}
