import {BaseDao} from "./base-dao";
import {Db, ObjectId, UpdateQuery} from "mongodb";
import {v4 as uuid} from "uuid";
import moment = require("moment");

export type Right = 'ADMIN' | 'TRAINING' | undefined;

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  rights: Array<Right>;
  lastTokenGeneration?: string;
  token?: string;
  _id?: string;
}

export class UserValidator {
  static check(user: User) {
    const errors = new Map<String, String>();
    this.checkEmailValue(user, errors);
    if (!user.firstname || user.firstname.length === 0) {
      errors.set('firstname', 'Firstname is required');
    }
    if (!user.lastname || user.lastname.length === 0) {
      errors.set('lastname', 'Lastname is required');
    }
    return errors;
  }

  private static checkEmailValue(user: User, errors: Map<String, String>) {
    if (!user.email || user.email.indexOf('@') < 0 || user.email.indexOf('.') < 0) {
      errors.set('email', 'Email is invalid');
    }
  }

  static checkEmail(user: User) {
    const errors = new Map<String, String>();
    this.checkEmailValue(user, errors);
    return errors;
  }

  static checkEmailAndToken(user: User) {
    const errors = new Map<String, String>();
    if (!user.token) {
      errors.set('token', 'Token is required');
    }
    this.checkEmailValue(user, errors);
    return errors;
  }
}

export class UserDao extends BaseDao<User> {

  constructor(db: Db) {
    super('users', db);
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
console.log('TTTTTTTTTTTTTTTTTT REGENRETAER')
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
