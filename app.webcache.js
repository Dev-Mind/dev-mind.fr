const serveStatic = require('serve-static');

exports.setCustomCacheControl = (res, path) => {
  switch(serveStatic.mime.lookup(path)){
    case 'application/xhtml+xml':
    case 'text/html':
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Expires', '-1');
      res.setHeader('Pragma', 'no-cache');
      break;

    case 'text/javascript':
    case 'application/x-javascript':
    case 'application/javascript':
      if(path.indexOf('sw.js') >= 0){
        res.setHeader('Cache-Control', 'private, max-age=0');
      }
      else{
        res.setHeader('Cache-Control', 'private, max-age=14400');
      }
      break;

    case 'text/css':
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
};