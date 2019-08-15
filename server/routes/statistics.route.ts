import {Request, Response} from "express";
import {BaseRoute} from "./base.route";
import {Router} from "express-serve-static-core";
import {SiteDailyVisitDao, UniquePageVisitDao} from "../model/statistic.dao";
import moment = require("moment");

export class StatisticsRoute extends BaseRoute {

  constructor(private uniquePageVisitDao: UniquePageVisitDao,
              private siteDailyVisitDao: SiteDailyVisitDao) {
    super();
  }

  public static create(router: Router,
                       uniquePageVisitDao: UniquePageVisitDao,
                       siteDailyVisitDao: SiteDailyVisitDao) {
    const route = new StatisticsRoute(uniquePageVisitDao, siteDailyVisitDao);

    router.get("/statistics/pages", (req: Request, res: Response) => {
      route.findAll(req, res);
    });

    router.get("/statistics/visit", (req: Request, res: Response) => {
      route.findAllByDay(req, res);
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
        console.log(list)
        const chart = list.map(elt => `{x: ${moment(elt._id).format('x')}, y: ${elt.count}}`).join(',');
        super.addToModel('chart', `[${chart}]`);
        this.render(req, res, 'stats-visits', 'Page visits per day');
      });
  }
}
