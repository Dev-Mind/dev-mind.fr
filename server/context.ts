import {LoginRoute} from "./routes/login-route";
import {UsersRoute} from "./routes/users-route";
import {Db} from "mongodb";
import {Router} from "express";
import {UserDao} from "./service/user-dao";
import {Mailer, MailerConfig} from "./service/mailer";
import {SecurityService} from "./service/security";
import {CacheService} from "./service/cache";

export class Context {

  private _loginRoute: LoginRoute;
  private _userRoute: UsersRoute;
  private _userDao: UserDao;
  private _mailer: Mailer;
  private _securityService: SecurityService;
  private _cacheService: CacheService;

  constructor(private db: Db, private router: Router, private mailerConfig: MailerConfig){

  }

  loadRoutes(){
    this.loginRoute;
    this.userRoute;
  }

  get securityService(): SecurityService {
    if(!this._securityService){
      this._securityService = SecurityService.create(this.userDao, this.mailer);
    }
    return this._securityService;
  }

  get cacheService(): CacheService {
    if(!this._cacheService){
      this._cacheService = CacheService.create();
    }
    return this._cacheService;
  }

  get loginRoute(): LoginRoute {
    if(!this._loginRoute){
      this._loginRoute = LoginRoute.create(this.router, this.userDao, this.securityService);
    }
    return this._loginRoute;
  }

  get userRoute(): UsersRoute {
    if(!this._userRoute){
      this._userRoute = UsersRoute.create(this.router, this.userDao);
    }
    return this._userRoute;
  }

  get userDao(): UserDao {
    if(!this._userDao){
      this._userDao = new UserDao(this.db);
    }
    return this._userDao;
  }

  get mailer(): Mailer {
    if(!this._mailer){
      this._mailer = new Mailer(this.mailerConfig);
    }
    return this._mailer;
  }
}
