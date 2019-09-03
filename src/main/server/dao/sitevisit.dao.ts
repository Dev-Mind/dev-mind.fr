import {BaseDao} from "./base.dao";
import {Db, UpdateQuery} from "mongodb";
import {COLLECTION_STATS_DAILYVISITS, DailySiteVisit} from "../model/statistic";

export class SiteDailyVisitDao extends BaseDao<DailySiteVisit> {

  constructor(db: Db) {
    super(COLLECTION_STATS_DAILYVISITS, db);
  }

  findAll(): Promise<Array<DailySiteVisit>> {
    return this.collection.aggregate([
      { $group: { _id: "$day", count: { $sum: "$count" } } },
      { $sort: { count: -1 } }
    ]).toArray();
  }

  addVisitIfNotExist(ip: string, day: string) {
    this.collection
      .findOne({ip: ip, day: day})
      .then(result => {
        if (!result) {
          const visit: DailySiteVisit = {ip: ip, day: day, count: 1};
          this.collection.insertOne(visit);
        } else {
          this.collection.updateOne({ip: ip, day: day}, this.updateQuery(result));
        }
      });
  }

  updateQuery(element: DailySiteVisit): UpdateQuery<DailySiteVisit> {
    return {
      $set: {
        ip: element.ip,
        day: element.day,
        count: element.count++
      }
    };
  }
}
