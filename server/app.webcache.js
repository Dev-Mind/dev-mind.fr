const serveStatic = require('serve-static');

const nocache = (res) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
};

exports.setCustomCacheControl = (res, path) => {
  switch(serveStatic.mime.lookup(path)){
    case 'application/xhtml+xml':
    case 'text/html':
      nocache(res);
      break;

    case 'text/javascript':
    case 'application/x-javascript':
    case 'application/javascript':
      if(path.indexOf('sw.js') >= 0){
        nocache(res);
      }
      else{
        res.setHeader('Cache-Control', 'private, max-age=14400');
      }
      break;

    case 'text/css':
      if(process.env.NODE_ENV === 'prod'){
        res.setHeader('Cache-Control', 'private, max-age=14400');
      }
      else{
        nocache(res);
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
};