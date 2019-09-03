import {BaseDao} from "./base.dao";
import {Db} from "mongodb";
import {COLLECTION_STATS_USERVISITS, DailySiteVisit, UserPageVisit} from "../model/statistic";

export class UserPageVisitDao extends BaseDao<UserPageVisit> {

  constructor(db: Db) {
    super(COLLECTION_STATS_USERVISITS, db);
  }

  findAll(): Promise<Array<DailySiteVisit>> {
    return this.collection.aggregate([
      {$group: {_id: "$ip", count: {$sum: 1}}},
      {$sort: {count: -1}}
    ]).toArray();
  }

  addVisitIfNotExist(ip: string, url: string): Promise<boolean> {
    return this.collection.findOne({ip: ip, url: url}).then(result => {
      if (!result) {
        const visit: UserPageVisit = {ip: ip, url: url};
        this.collection.insertOne(visit);
      }
      return new Promise<boolean>(resolve => resolve(!result));
    });
  }
}
