import {Request, Response} from "express";
import {BaseRoute} from "./base.route";
import {Router} from "express-serve-static-core";
import {UniquePageVisitDao} from "../dao/uniquepage.dao";
import {SiteDailyVisitDao} from "../dao/sitevisit.dao";
import {UserPageVisitDao} from "../dao/userpage.dao";
import moment = require("moment");

export class StatisticsRoute extends BaseRoute {

  constructor(private uniquePageVisitDao: UniquePageVisitDao,
              private siteDailyVisitDao: SiteDailyVisitDao,
              private userPageVisitDao: UserPageVisitDao) {
    super();
  }

  public static create(router: Router,
                       uniquePageVisitDao: UniquePageVisitDao,
                       siteDailyVisitDao: SiteDailyVisitDao,
                       userPageVisitDao: UserPageVisitDao) {
    const route = new StatisticsRoute(uniquePageVisitDao, siteDailyVisitDao, userPageVisitDao);

    router.get("/statistics/pages", (req: Request, res: Response) => {
      route.findAll(req, res);
    });

    router.get("/statistics/visit", (req: Request, res: Response) => {
      route.findAllByDay(req, res);
    });

    router.get("/statistics/users", (req: Request, res: Response) => {
      route.findUsers(req, res);
    });

    router.get("/statistics/users2", (req: Request, res: Response) => {
      route.findUsersBySite(req, res);
    });

    return route;
  }


  private findAll(req: Request, res: Response) {
    this.uniquePageVisitDao
      .findAll()
      .then(list => {
        super.addToModel('stats', list.sort((a,b) => b.count - a.count));
        this.render(req, res, 'stats-page-visits', 'Page visits');
      });
  }

  private findAllByDay(req: Request, res: Response) {
    this.siteDailyVisitDao
      .findAll()
      .then(list => {
        super.addToModel('stats', list);
        const chart = list.map(elt => `{x: ${moment(elt._id).format('x')}, y: ${elt.count}}`).join(',');
        super.addToModel('chart', `[${chart}]`);
        this.render(req, res, 'stats-visits', 'Page visits per day');
      });
  }

  private findUsers(req: Request, res: Response) {
    this.userPageVisitDao
      .findAll()
      .then(list => {
        super.addToModel('stats', list);
        this.render(req, res, 'stats-users', 'User visits');
      });
  }

  private findUsersBySite(req: Request, res: Response) {
    this.userPageVisitDao
      .findAllBySite()
      .then(list => {
        super.addToModel('stats', list);
        this.render(req, res, 'stats-users', 'User visits');
      });
  }
}
