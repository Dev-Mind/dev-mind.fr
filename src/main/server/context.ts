import {LoginRoute} from "./routes/login.route";
import {UsersRoute} from "./routes/users.route";
import {Db} from "mongodb";
import {Router} from "express";
import {UserDao} from "./dao/user.dao";
import {MailerService} from "./service/mailer.service";
import {SecurityService} from "./service/security.service";
import {CacheService} from "./service/cache.service";
import {StatisticService} from "./service/statistic.service";
import {StatisticsRoute} from "./routes/statistics.route";
import {MailerConfig} from "./model/mailer.config";
import {UniquePageVisitDao} from "./dao/uniquepage.dao";
import {UserPageVisitDao} from "./dao/userpage.dao";
import {SiteDailyVisitDao} from "./dao/sitevisit.dao";
import {WindowsRoute} from "./routes/windows.route";

export class Context {

  private _loginRoute: LoginRoute;
  private _windowRoute: WindowsRoute;
  private _userRoute: UsersRoute;
  private _statisticsRoute: StatisticsRoute;
  private _userDao: UserDao;
  private _uniquePageVisitDao: UniquePageVisitDao;
  private _userPageVisitDao: UserPageVisitDao;
  private _siteDailyVisitDao: SiteDailyVisitDao;
  private _mailer: MailerService;
  private _securityService: SecurityService;
  private _cacheService: CacheService;
  private _statisticService: StatisticService;

  constructor(private db: Db, private router: Router, private mailerConfig: MailerConfig) {

  }

  loadRoutes() {
    this.loginRoute;
    this.userRoute;
    this.statisticsRoute;
    this.windowRoute;
  }

  get statisticService(): StatisticService {
    if (!this._statisticService) {
      this._statisticService = new StatisticService(this.uniquePageVisitDao, this.userPageVisitDao, this.siteDailyVisitDao);
    }
    return this._statisticService;
  }

  get securityService(): SecurityService {
    if (!this._securityService) {
      this._securityService = SecurityService.create(this.userDao, this.mailer);
    }
    return this._securityService;
  }

  get cacheService(): CacheService {
    if (!this._cacheService) {
      this._cacheService = CacheService.create();
    }
    return this._cacheService;
  }

  get windowRoute(): WindowsRoute {
    if (!this._windowRoute) {
      this._windowRoute = WindowsRoute.create(this.router);
    }
    return this._windowRoute;
  }

  get loginRoute(): LoginRoute {
    if (!this._loginRoute) {
      this._loginRoute = LoginRoute.create(this.router, this.userDao, this.securityService);
    }
    return this._loginRoute;
  }

  get userRoute(): UsersRoute {
    if (!this._userRoute) {
      this._userRoute = UsersRoute.create(this.router, this.userDao);
    }
    return this._userRoute;
  }

  get statisticsRoute(): StatisticsRoute {
    if (!this._statisticsRoute) {
      this._statisticsRoute = StatisticsRoute.create(this.router, this.uniquePageVisitDao, this.siteDailyVisitDao, this.userPageVisitDao);
    }
    return this._statisticsRoute;
  }

  get userDao(): UserDao {
    if (!this._userDao) {
      this._userDao = new UserDao(this.db);
    }
    return this._userDao;
  }

  get uniquePageVisitDao(): UniquePageVisitDao {
    if (!this._uniquePageVisitDao) {
      this._uniquePageVisitDao = new UniquePageVisitDao(this.db);
    }
    return this._uniquePageVisitDao;
  }

  get userPageVisitDao(): UserPageVisitDao {
    if (!this._userPageVisitDao) {
      this._userPageVisitDao = new UserPageVisitDao(this.db);
    }
    return this._userPageVisitDao;
  }

  get siteDailyVisitDao(): SiteDailyVisitDao {
    if (!this._siteDailyVisitDao) {
      this._siteDailyVisitDao = new SiteDailyVisitDao(this.db);
    }
    return this._siteDailyVisitDao;
  }

  get mailer(): MailerService {
    if (!this._mailer) {
      this._mailer = new MailerService(this.mailerConfig);
    }
    return this._mailer;
  }
}
