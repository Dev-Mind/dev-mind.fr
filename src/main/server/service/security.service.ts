import {NextFunction, Request, Response} from "express";
import {RESOURCES_EXTENSION} from "./cache.service";
import {Right, User} from "../model/user";
import {MailerService} from "./mailer.service";
import {UserDao} from "../dao/user.dao";
import moment = require("moment");

export interface SecuredUrl {
  url: string;
  right: Right;
}

const COOKIE_ID_PARAM = 'APIID';
const IS_PROD = process.env.NODE_ENV && (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production');

export class SecurityService {

  constructor(private userDao: UserDao, private mailer: MailerService) {
  }

  static create(userDao: UserDao, mailer: MailerService) {
    return new SecurityService(userDao, mailer);
  }

  rewrite() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Rewriting is only available in prod
      if (IS_PROD) {
        const httpInForwardedProto = req.headers && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'http';
        const httpInReferer = req.headers && req.headers.referer && req.headers.referer.indexOf('http://') >= 0;
        const hostWwwInHeader = req.headers && req.headers.host && req.headers.host.indexOf('www') >= 0;
        const isHtmlPage = req.url.indexOf(".html") >= 0;

        if ((isHtmlPage || req.url === '/') && (httpInForwardedProto || httpInReferer)) {
          console.log('User is not in HTTP, he is redirected');
          res.redirect('https://dev-mind.fr' + req.url);
        }
        //Redirection on domain without www don't work. So this feature is disabled
        else if ((isHtmlPage || req.url === '/') && hostWwwInHeader) {
          console.log('User is not on www, he is redirected');
          res.status(301).redirect('https://dev-mind.fr/index.html');
        } else {
          next();
        }
      } else {
        next();
      }
    }
  }

  getUser(req: Request): Promise<User> {
    if (req.signedCookies && req.signedCookies[COOKIE_ID_PARAM]) {
      const credentials = Buffer.from(req.signedCookies[COOKIE_ID_PARAM], 'base64').toString('ascii').split(':');
      const user = {
        email: credentials[0],
        token: credentials[1]
      } as User;
      return this.checkAuthentication(user);
    }
    return new Promise<User>((resolve) => resolve(undefined));
  }

  checkAuth(securedUrls: Array<SecuredUrl>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const optionalSecuredUrls = securedUrls.filter(pattern => req.url.indexOf(pattern.url) >= 0);
      const isWebResource = RESOURCES_EXTENSION.map(extension => req.url.indexOf(extension)).filter(i => i < 0).length > 0;

      if (optionalSecuredUrls.length > 0 && isWebResource) {
        // We need to check autent and rights
        if (req.signedCookies && req.signedCookies[COOKIE_ID_PARAM]) {
          const credentials = Buffer.from(req.signedCookies[COOKIE_ID_PARAM], 'base64').toString('ascii').split(':');
          const user = {
            email: credentials[0],
            token: credentials[1]
          } as User;

          this.checkAuthentication(user)
            .then(result => this.checkRight(result, optionalSecuredUrls[0]))
            .then(result => {
              if (result) {
                next();
              } else {
                res.redirect(`/noright`);
              }
            });
        } else {
          res.redirect(`/login`);
        }
      } else {
        next();
      }
    }
  }

  checkAuthentication(user: User): Promise<User> {
    return this.userDao.findByEmail(user.email)
      .then(result =>
        new Promise<User>((resolve) => {
          if(result){
            const tokenAge = result.lastTokenGeneration ? moment().diff(moment(result.lastTokenGeneration), 'hours') : 999;
            if (user.token === result.token && tokenAge <= 48) {
              resolve(result);
            } else {
              resolve(null);
            }
          }
          else{
            resolve(null);
          }
        }));
  }

  checkRight(user: User, securedUrl: SecuredUrl): Promise<User> {
    return new Promise<User>((resolve) => {
      const anonymous = securedUrl.right === undefined;
      if (user && (anonymous || this.hasRight(user, 'ADMIN') || this.hasRight(user, securedUrl.right))) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  }

  private hasRight(user: User, right: Right): boolean {
    return user.rights && user.rights.indexOf(right) >= 0;
  }

  updateToken(user: User): Promise<User> {
    return this.userDao
      .updateToken(user)
      .then(result => {
        this.mailer.sendMail(
          result.email,
          '[Dev-Mind] Authentication token',
          `<p>Hello ${user.firstname}</p>
                <a>You received this email because you tried to log in on Dev-Mind website. To finalize your connection 
                   you can copy this token <b>${user.token}</b> in the form or you can click on 
                   this <a href="https://dev-mind.fr/token?email=${user.email}&token=${user.token}">link to open this page</a>.
                </p>
                <p>Guillaume EHRET</p>`);
        return new Promise<User>((resolve) => resolve(user));
      })
  }

  addCredentialInCookies(res: Response, user: User) {
    res.cookie(COOKIE_ID_PARAM, new Buffer(user.email + ':' + user.token).toString('base64'), {
      maxAge: 60 * 60 * 1000 * 24,
      signed: true,
      httpOnly: true,
      secure: IS_PROD,
      sameSite: true
    });
  }

  removeCredentialFromCookies(res: Response) {
    res.clearCookie(COOKIE_ID_PARAM);
  }

  corsPolicy() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    }
  }

  securityPolicy() {
    return () => ({
      directives: {
        defaultSrc: ["'self'", "'none'"],
        // We have to authorize inline CSS used to improve firstload
        styleSrc: ["'unsafe-inline'", "'self'"],
        // We have to authorize data:... for SVG images
        imgSrc: ["'self'", 'data:', 'https:'],
        // We have to authorize inline script used to load our JS app
        scriptSrc: ["'self'", "'unsafe-inline'",
          "https://storage.googleapis.com/workbox-cdn/*",
          "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-core.prod.js",
          "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-precaching.prod.js"],
        objectSrc: ["'self'"]
      }
    })
  }
}
