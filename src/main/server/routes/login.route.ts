import {Request, Response} from "express";
import {BaseRoute} from "./base.route";
import {Router} from "express-serve-static-core";
import {UserDao, UserValidator} from "../model/user.dao";
import {SecurityService} from "../service/security.service";
import {User} from "../model/user";

export class LoginRoute extends BaseRoute {

  constructor(private userDao: UserDao, private security: SecurityService) {
    super();
  }

  public static create(router: Router, userDao: UserDao, security: SecurityService): LoginRoute {
    const route = new LoginRoute(userDao, security);

    router.get("/login", (req: Request, res: Response) => {
      route.loginView(req, res, undefined);
    });

    router.get("/logout", (req: Request, res: Response) => {
      route.logout(req, res);
    });

    router.get("/token", (req: Request, res: Response) => {
      route.displayToken(req, res);
    });

    router.get("/profile", (req: Request, res: Response) => {
      route.displayProfile(req, res);
    });

    router.post("/login", (req: Request, res: Response) => {
      const user = req.body as User;
      const errors = UserValidator.checkEmail(user);
      if (errors.size > 0) {
        route.loginView(req, res, user, false, errors);
      } else {
        route.login(req, res, user);
      }
    });

    router.post("/token", (req: Request, res: Response) => {
      const user = req.body as User;
      const errors = UserValidator.checkEmailAndToken(user);
      if (errors.size > 0) {
        route.tokenView(req, res, user, false, errors);
      } else {
        route.addTokenInCookie(req, res, user);
      }
    });

    router.post("/login/create", (req: Request, res: Response) => {
      // We can create user
      const user = req.body as User;
      user.rights = [];
      const errors = UserValidator.check(user);
      if (!(user as any).agreement) {
        errors.set('agreement', 'You must accept the Terms of Service if you want to use the secure website');
      }
      if (errors.size > 0) {
        route.loginView(req, res, user, true, errors);
      } else {
        route.create(req, res, user);
      }
    });

    return route;
  }

  public login(req: Request, res: Response, user: User) {
    this.userDao
      .findByEmail(user.email)
      .then(result => {
        if (result) {
          this.sendToken(req, res, result);
        } else {
          console.log(`Login => ${user.email} does not exist, send form to create user`);
          this.loginView(req, res, user, true);
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  public create(req: Request, res: Response, user: User) {
    this.userDao
      .findByEmail(user.email)
      .then(result => {
        if (result) {
          // Error because email exists
          const errors = new Map<string, string>();
          errors.set('email', 'This email is already used');
          this.loginView(req, res, user, true, errors);
        } else {
          console.log('Login => Create user ' + user.email);
          this.userDao.upsert(user);
          // and send a token
          this.sendToken(req, res, user);
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  public displayToken(req: Request, res: Response) {
    const email = req.query.email;
    console.log(email)
    this.userDao
      .findByEmail(email)
      .then(result => {
        const user = {email: email, token: req.query.token} as User;
        if (result) {
          this.tokenView(req, res, user, false);
        } else {
          this.loginView(req, res, user, true);
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  public displayProfile(req: Request, res: Response) {
    this.security
      .getUser(req)
      .then(user => {
        if (user) {
          this.addToModel('user', {email: user.email, firstname: user.firstname, lastname: user.lastname});
          this.addToModel('rights', {
            admin: user.rights.indexOf('ADMIN') >= 0,
            training: user.rights.indexOf('TRAINING') >= 0,
          });
          this.render(req, res, 'profile', 'Your profile');
        } else {
          this.loginView(req, res, undefined);
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  public tokenView(req: Request, res: Response, user: User, afterSent: boolean = true, errors ?: Map<string, string>) {
    this.addToModel('user', user);
    if (errors) {
      this.addErrorsToModel(errors);
    }
    this.addToModel('afterSent', afterSent);
    this.render(req, res, 'token', afterSent ? 'Token sent' : 'Send your token');
  }

  public loginView(req: Request, res: Response, user: User, ext: boolean = false, errors ?: Map<string, string>) {
    this.addToModel('extended', ext);
    this.addToModel('user', user);
    if (errors) {
      this.addErrorsToModel(errors);
    }
    this.render(req, res, 'login', 'Authentification');
  }

  public sendToken(req: Request, res: Response, user: User) {
    this.security
      .updateToken(user)
      .then(result => this.tokenView(req, res, { email: result.email} as User))
      .catch(reason => this.renderError(req, res, reason));
  }

  public addTokenInCookie(req: Request, res: Response, user: User) {
    this.security
      .checkAuthentication(user)
      .then(result => {
        if (result) {
          this.security.addCredentialInCookies(res, result);
          res.redirect('/profile');
        } else {
          const errors = new Map<string, string>();
          errors.set('token', 'Token or email is invalid. Try to generate a new one');
          this.tokenView(req, res, user, false, errors);
        }
      })
      .catch(reason => this.renderError(req, res, reason));
  }

  public logout(req: Request, res: Response) {
    this.security.removeCredentialFromCookies(res);
    res.redirect('/');
  }
}
