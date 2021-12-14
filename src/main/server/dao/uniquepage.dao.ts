import {BaseDao} from "./base.dao";
import {Db, ObjectId, UpdateQuery} from "mongodb";
import {COLLECTION_STATS_PAGEVISITS, UniquePageVisit} from "../model/statistic";


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

  deleteByUrl(url: string) {
    return this.collection.deleteMany({url: url});
  }
}
