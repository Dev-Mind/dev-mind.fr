const md5 = require('md5');
const isProd = process.env.NODE_ENV && process.env.NODE_ENV === 'prod';

/**
 * used to initailize session
 */
exports.sessionAttributes = (secret) => ({
  secret: secret,
  // A session life is 30min
  duration: 30 * 60 * 1000,
  // We don't authorize a session resave
  resave: false,
  saveUninitialized: true,
  // Secured cookies are only set in production
  cookie: {secure: isProd},
  // User by default is empty
  user: {}
});

exports.corsPolicy = () => {
  return (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://dev-mind.fr");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }
};

/**
 * used with helmet.contentSecurityPolicy
 */
exports.securityPolicy = () => ({
  directives: {
    defaultSrc: ["'self'", "https://*.firebaseio.com"],
    // We have to authorize inline CSS used to improve firstload
    styleSrc: ["'unsafe-inline'", "'self'"],
    // We have to authorize data:... for SVG images
    imgSrc: ["'self'", 'data:', 'https:'],
    // We have to authorize inline script used to load our JS app
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com/analytics.js',
      "https://*.gstatic.com",
      //"https://www.gstatic.com/firebasejs/4.0.0/firebase-database.js",
      "https://*.firebaseio.com"],
    objectSrc: ["'self'"],
    connectSrc: ["'self'", "wss://*.firebaseio.com", "https://*.firebaseio.com"]
  }
});

exports.rewrite = () => {
  return (req, res, next) => {
    if(isProd){
      const httpInForwardedProto = req.headers && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'http';
      const httpInReferer = req.headers && req.headers.referer && req.headers.referer.indexOf('http://') >=0;
      const hostWwwInHeader = req.headers && req.headers.host && req.headers.host.indexOf('www') >=0;
      const isHtmlPage = req.url.indexOf(".html") >= 0;

      if((isHtmlPage || req.url === '/')  && (httpInForwardedProto || httpInReferer || hostWwwInHeader)){
        console.log('User is not in HTTP, he is redirected');
        res.redirect('https://dev-mind.fr' + req.url);
      }
      else{
        next();
      }
    }
    else{
      next();
    }
  };
};

/**
 * We have to check if user is authenticated when secured URL are used
 */
exports.checkAuth = (securedUrls) => {

  return (req, res, next) => {
    const isSecuredUrl = securedUrls.map(pattern => req.url.indexOf(pattern)).filter(i => i >= 0).length > 0;
    const isHtmlPage = req.url.indexOf(".html") >= 0;
    const isNotAuthenticated = (!req.session || !req.session.user || !req.session.user.username);

    if (isSecuredUrl && isNotAuthenticated && isHtmlPage) {
      res.redirect(`/401.html`);
    }
    else {
      next();
    }
  };
};

exports.notFoundHandler = () =>{
  return (req, res) => res.redirect(`/404.html`);
};

/**
 * Handler used to clean up a session after logout
 */
exports.logoutHandler = () => {
  return (req, res) => {
    req.session.user = {};
    return res.redirect('/');
  };
};

/**
 * Handler used to log somedy
 */
exports.loginHandler = (users) => {
  return (req, res) => {
    if (!req.body || !req.body.password || !req.body.username) {
      return res.redirect(`/401.html`);
    }
    if (users.filter(user => user.username === req.body.username && user.password === md5(req.body.password)).length > 0) {
      req.session.user = {username: req.body.username};
      return res.redirect('/training/trainings.html');
    }
    else {
      req.session.user = {};
      return res.redirect('/401.html?authentication_failed');
    }
  };
};