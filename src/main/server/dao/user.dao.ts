import {CrudDao} from "./base.dao";
import {Db, ObjectId, UpdateQuery} from "mongodb";
import {v4 as uuid} from "uuid";
import {User} from "../model/user";
import moment = require("moment");


export const COLLECTION_USERS = 'users';

export class UserValidator {
  static check(user: User) {
    const errors = new Map<string, string>();
    this.checkEmailValue(user, errors);
    if (!user.firstname || user.firstname.length === 0) {
      errors.set('firstname', 'Firstname is required');
    }
    if (!user.lastname || user.lastname.length === 0) {
      errors.set('lastname', 'Lastname is required');
    }
    return errors;
  }

  private static checkEmailValue(user: User, errors: Map<string, string>) {
    if (!user.email || user.email.indexOf('@') < 0 || user.email.indexOf('.') < 0) {
      errors.set('email', 'Email is invalid');
    }
  }

  static checkEmail(user: User) {
    const errors = new Map<string, string>();
    this.checkEmailValue(user, errors);
    return errors;
  }

  static checkEmailAndToken(user: User) {
    const errors = new Map<string, string>();
    if (!user.token) {
      errors.set('token', 'Token is required');
    }
    this.checkEmailValue(user, errors);
    return errors;
  }
}

export class UserDao extends CrudDao<User> {

  constructor(db: Db) {
    super(COLLECTION_USERS, db);
  }

  findByEmail(email: string): Promise<User> {
    return this.collection.findOne({email: email});
  }

  updateQuery(element: User): UpdateQuery<User> {
    return {
      $set: {
        firstname: element.firstname,
        lastname: element.lastname,
        email: element.email,
        rights: element.rights
      }
    };
  }

  updateToken(user: User): Promise<User> {
    const lastTokenGeneration = moment().format();
    const token = uuid();
    return this.collection.updateOne({_id: new ObjectId(user._id)}, {
      $set: {
        lastTokenGeneration: lastTokenGeneration,
        token: token,
      }
    }).then(_ => {
      user.lastTokenGeneration = lastTokenGeneration;
      user.token = token;
      return user;
    });
  }
}
