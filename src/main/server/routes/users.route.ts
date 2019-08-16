import {Request, Response} from "express";
import {BaseRoute} from "./base.route";
import {Router} from "express-serve-static-core";
import {UserDao, UserValidator} from "../model/user.dao";
import {ObjectId} from "bson";
import {User} from "../model/user";

export class UsersRoute extends BaseRoute {

  constructor(private userDao: UserDao) {
    super();
  }

  public static create(router: Router, userDao: UserDao) {
    const route = new UsersRoute(userDao);
    router.get("/users", (req: Request, res: Response) => {
      route.findAll(req, res);
    });
    router.get("/users/create", (req: Request, res: Response) => {
      route.create(req, res)
    });
    router.get("/users/:userId", (req: Request, res: Response) => {
      route.findById(req, res, req.params.userId);
    });
    router.post("/users/:userId/delete", (req: Request, res: Response) => {
      route.deleteById(req, res, req.params.userId);
    });
    router.post("/users", (req: Request, res: Response) => {
      route.upsert(req, res, req.body);
    });
    return route;
  }


  private findAll(req: Request, res: Response) {
    this.userDao
      .findAll()
      .then(list => {
        super.addToModel('users', list);
        this.render(req, res, 'users', 'User list');
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  private findById(req: Request, res: Response, id: string) {
    this.userDao
      .findById(id)
      .then(user => {
        this.addUserInModel(user);
        this.render(req, res, 'user', 'User update');
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  private deleteById(req: Request, res: Response, id: string) {
    this.userDao.deleteById(id)
      .then(_ => this.findAll(req, res))
      .catch(reason => this.renderError(req, res, reason));
  }

  private create(req: Request, res: Response) {
    this.addUserInModel(null);
    this.render(req, res, 'user', 'User creation');
  }

  private upsert(req: Request, res: Response, user: User) {
    this.userDao.findByEmail(user.email)
      .then(result => {
        const errors = UserValidator.check(user);
        if ((result && !user._id) || (result && !new ObjectId(user._id).equals(result._id))) {
          errors.set('email', 'This email is already used');
        }

        if (errors.size > 0) {
          this.addUserInModel(user);
          super.addErrorsToModel(errors);
          this.render(req, res, 'user', 'User creation');
        } else {
          this.userDao.upsert(user)
            .then(result => this.findAll(req, res))
            .catch(reason => this.renderError(req, res, reason));
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  private addUserInModel(user: User) {
    super.addToModel('user', user);
    if (user && user.rights) {
      super.addToModel('rights', {
        admin: user.rights.indexOf('ADMIN') >= 0,
        training: user.rights.indexOf('TRAINING') >= 0
      });
    }
  }
}
