import {Request, Response} from "express";

/**
 * Each route will implement this class
 */
export class BaseRoute {

  private scripts: string[];
  private model = new Map<string, any>();

  constructor() {
    this.scripts = [];
  }

  /**
   * Add a JS external file to the request.
   */
  public addScript(src: string): BaseRoute {
    this.scripts.push(src);
    return this;
  }

  /**
   * Render a page.
   */
  public addToModel(key: string, value: any) {
    this.model.set(key, value);
  }

  public addErrorsToModel(errors: Map<String, String>) {
    const err = {
      has: errors.size > 0
    };
    errors.forEach((value, field) => {
      err[field] = {
        has: true,
        msg: value
      };
    });
    this.addToModel('errors', err);
  }

  /**
   * Render a page.
   */
  public render(req: Request, res: Response, view: string, title: string) {
    //add constants
    res.locals.BASE_URL = "/";

    //add scripts
    res.locals.scripts = this.scripts;

    //add title
    res.locals.title = title;

    if (this.model.size > 0) {
      this.model.forEach((value, key) => res.locals[key] = value);
    }

    //render view
    res.render(view);
  }

  /**
   * Render a page.
   */
  public renderError(req: Request, res: Response, reason: string) {
    this.addToModel('error', reason);
    this.render(req, res, 'error', 'An error occured');
  }
}
