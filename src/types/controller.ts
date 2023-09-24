import { Request, Response, NextFunction, Router } from 'express';
import Middleware from './middleware';
import HttpError from './http-error';
import ExpressRouteMethod from './express-route-method';

export default class Controller {
  public path: string;
  public router: Router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
  }

  registerRoute(method: ExpressRouteMethod, path: string, ...middlewares: Array<Middleware>): void {
    const handler: Middleware = middlewares.pop();
    this.router[method](path, ...middlewares, async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (e: unknown) {
        if (e instanceof HttpError) {
          return res.status(e.code).json({ error: e.message });
        } else {
          console.error(e);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });
  }

  get(path: string, ...middlewares: Array<Middleware>): void {
    this.registerRoute('get', path, ...middlewares);
  }

  post(path: string, ...middlewares: Array<Middleware>): void {
    this.registerRoute('post', path, ...middlewares);
  }

  patch(path: string, ...middlewares: Array<Middleware>): void {
    this.registerRoute('patch', path, ...middlewares);
  }

  put(path: string, ...middlewares: Array<Middleware>): void {
    this.registerRoute('put', path, ...middlewares);
  }

  delete(path: string, ...middlewares: Array<Middleware>): void {
    this.registerRoute('delete', path, ...middlewares);
  }
}
