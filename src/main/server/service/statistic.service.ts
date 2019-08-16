import {NextFunction, Request, Response} from "express";
import {SiteDailyVisitDao, UniquePageVisitDao, UserPageVisitDao} from "../model/statistic.dao";
import moment = require("moment");


export class StatisticService {

  constructor(private uniquePageVisitDao: UniquePageVisitDao,
              private userPageVisitDao: UserPageVisitDao,
              private siteDailyVisitDao: SiteDailyVisitDao) {
  }

  visitTracker() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip: string = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || req.socket.remoteAddress;
      if (req.url) {
        const extension = StatisticService.getExtension(req.url);
        if (extension === undefined || extension === 'html') {
          // We need to add a new element in stat page
          this.userPageVisitDao
            .addVisitIfNotExist(ip, req.url)
            .then(added => {
              // If user has never seen the page we increment page count
              if (!added) {
                this.uniquePageVisitDao.updateVisit(req.url);
              }
            });
          this.siteDailyVisitDao.addVisitIfNotExist(ip, moment().format('YYYY-MM-DD'));
        }
      }
      next();
    }
  }

  private static getExtension(url: string): string {
    const realUrl = (url.indexOf('?') > 0) ? url.split('?')[0] : url;
    const splitForExt = realUrl.split('.');
    return splitForExt.length > 1 ? splitForExt[splitForExt.length - 1] : undefined;
  }
}
