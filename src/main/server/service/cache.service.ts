import * as serveStatic from 'serve-static';
import {Response} from "express";

export const RESOURCES_EXTENSION = ['.gif', '.ico', '.css', '.png', '.tiff', '.webp', '.js', '.ts'];

export class CacheService {

  static create() {
    return new CacheService();
  }

  static nocache(res: Response) {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
  }

  setCustomCacheControl() {
    return (res, path) => {
      switch (serveStatic.mime.getType(path)) {
        case 'application/xhtml+xml':
        case 'text/html':
          CacheService.nocache(res);
          break;

        case 'text/javascript':
        case 'application/x-javascript':
        case 'application/javascript':
          if (path.indexOf('sw.js') >= 0) {
            CacheService.nocache(res);
          } else {
            res.setHeader('Cache-Control', 'private, max-age=14400');
          }
          break;

        case 'text/css':
          if (process.env.NODE_ENV === 'prod') {
            res.setHeader('Cache-Control', 'private, max-age=14400');
          } else {
            CacheService.nocache(res);
          }
          break;

        case 'image/gif':
        case 'image/jpg':
        case 'image/jpeg':
        case 'image/png':
        case 'image/tiff':
        case 'image/svg+xml':
        case 'image/webp':
        case 'image/vnd.microsoft.icon':
        case 'image/icon':
        case 'image/ico':
        case 'image/x-ico':
          res.setHeader('Cache-Control', 'public, max-age=691200');
          break;

        default:
      }
    }
  }
}

