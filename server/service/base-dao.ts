/**
 * Each dao implement this class
 */
import {Db, ObjectId, UpdateQuery} from "mongodb";

export abstract class BaseDao<T> {

  constructor(private _collection: string, private db: Db) {

  }

  get collection() {
    return this.db.collection(this._collection);
  }

  findAll(callback: (elements: Array<T>) => any) {
    this.collection.find({}).toArray((err, docs: Array<T>) => {
      callback(docs);
    });
  }

  findById(id: string): Promise<T> {
    return this.collection.findOne({_id: new ObjectId(id)});
  }

  upsert(element: T): Promise<T> {
    const elementAny = (element as any);
    if(!elementAny._id){
      // We have to delete the property is user send info from a HTML form (in this case it could have the empty string value)
      delete elementAny._id;
      return this.collection.insertOne(element).then(_ =>  element);
    }
    else {
      return this.collection.updateOne({_id: new ObjectId((element as any)._id)}, this.updateQuery(element)).then(_ => element);
    }
  }

  abstract updateQuery(element: T):UpdateQuery<T>;

  deleteById(id: string) {
    return this.collection.deleteOne({_id: new ObjectId(id)});
  }

}
