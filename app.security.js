const md5 = require('md5');

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
  cookie: {secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production'},
  // User by default is empty
  user: {}
});

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

/**
 * We have to check if user is authenticated when secured URL are used
 */
exports.checkAuth = (securedUrls) => {

  return (req, res, next) => {
    console.log('Check security', req.url);
    const isSecuredUrl = securedUrls.map(pattern => req.url.indexOf(pattern)).filter(i => i >= 0).length > 0;
    const isHtmlPage = req.url.indexOf(".html").length > 0;
    const isNotAuthenticated = (!req.session || !req.session.user || !req.session.user.username);

    if (isSecuredUrl && isNotAuthenticated && isHtmlPage) {
      console.log('User is redirected in session', req.session.user, isSecuredUrl, isNotAuthenticated, isHtmlPage);
      return res.redirect(`/401.html`);
    }
    else {
      console.log('User is not redirected in session', req.session.user, isSecuredUrl, isNotAuthenticated, isHtmlPage);
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
      console.log('user trouve');
      req.session.user = {username: req.body.username};
      return res.redirect('/training/trainings.html');
    }
    else {
      console.log('user pas trouve');
      req.session.user = {};
      return res.redirect('/401.html?authentication_failed');
    }
  };
};