import {BaseDao} from "./base.dao";
import {Db, ObjectId, UpdateQuery} from "mongodb";
import {DailySiteVisit, UniquePageVisit, UserPageVisit} from "../model/statistic";


export const COLLECTION_STATS_PAGEVISITS = 'pagevisits';
export const COLLECTION_STATS_USERVISITS = 'userpagevisits';
export const COLLECTION_STATS_DAILYVISITS = 'dailysitevisits';

export class UniquePageVisitDao extends BaseDao<UniquePageVisit> {

  constructor(db: Db) {
    super(COLLECTION_STATS_PAGEVISITS, db);
  }

  findAll(): Promise<Array<UniquePageVisit>> {
    return this.collection.find({}).toArray();
  }

  updateVisit(url: string): Promise<UniquePageVisit> {
    return this.collection
      .findOne({url: url})
      .then(element => {
        if (element) {
          return this.collection
            .updateOne({_id: new ObjectId((element as any)._id)}, this.updateQuery(element))
            .then(_ => new Promise<UniquePageVisit>((resolve) => {
              element.count++;
              resolve(element)
            }))
        } else {
          return this.collection.insertOne({url: url, count: 1})
            .then(_ => new Promise<UniquePageVisit>((resolve) => resolve(element)))
        }

      });
  }

  initVisit(url: string, count: number) {
    this.collection.insertOne({url: url, count: count});
  }

  private updateQuery(element: UniquePageVisit): UpdateQuery<UniquePageVisit> {
    return {
      $set: {
        url: element.url,
        count: ++element.count
      }
    };
  }
}

export class UserPageVisitDao extends BaseDao<UserPageVisit> {

  constructor(db: Db) {
    super(COLLECTION_STATS_USERVISITS, db);
  }

  findAll(): Promise<Array<DailySiteVisit>> {
    return this.collection.aggregate([
      { $group: { _id: "$ip", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
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
