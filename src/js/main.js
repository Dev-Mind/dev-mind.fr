/* eslint-env browser */
window.app = (function () {
  'use strict';


  function purgeOldServiceWorkerCaches(scope) {
    // Service worker version is injected by gulp
    var actualVersion = $serviceWorkerVersion || 1;
    console.log('ServiceWorker version ' + actualVersion + ' registration successful with scope: ', scope)

    var expectedCacheKeys = [
      'images-v' + actualVersion,
      'images-svg-v' + actualVersion,
      'google-fonts-webfonts',
      'static-resources-v' + actualVersion,
      'static-resources-css-v' + actualVersion,
      'html-resources-v' + actualVersion,
      'html-resources-sw-v' + actualVersion
    ];
    var expectedPreCacheKeys = 'dev-mind-precache-v';
    if (caches) {

      var parseKey = function (key) {
        var isActualSwFiles = expectedCacheKeys.includes(key) ||
          (key.startsWith(expectedPreCacheKeys) && key.indexOf('v' + actualVersion) >0);

        if (!isActualSwFiles) {
          console.log('Purge old SW cache entry : ' + key);
          caches.delete(key);
          if(window.indexedDB){
            console.log('delete database', key);
            window.indexedDB.deleteDatabase(key);
          }
        }
        return true;
      };

      var parseKeys = function (keys) {
        Promise.all(keys.map(parseKey));
      };

      caches.keys().then(parseKeys);
    }
  }

  function initSw() {

    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
                                // [::1] is the IPv6 localhost address.
                                window.location.hostname === '[::1]' ||
                                // 127.0.0.1/8 is considered localhost for IPv4.
                                window.location.hostname.match(
                                  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
                                )
    );

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || isLocalhost)) {

      navigator.serviceWorker
               .register('/sw.js')
               .then(function (registration) {

                 purgeOldServiceWorkerCaches(registration.scope);

                 registration.onupdatefound = function (event) {
                   var installingWorker = registration.installing;

                   installingWorker.onstatechange = function () {
                     console.log('new state : ', installingWorker.state)
                     switch (installingWorker.state) {
                       case 'installing':
                         console.log('installing...');
                         break;
                       case 'installed':
                         if (navigator.serviceWorker.controller) {
                           console.log('new update available');
                           location.reload(true);
                         }
                         break;

                       default:
                     }
                   }
                 }
               })
               .catch(function (e) {
                 console.error('Error during service worker registration:', e);
               });
    }
  }

  function changeMenu(section) {
    if (!section) {
      const paths = ['blog', 'experience', 'formation', 'training', 'profile'].filter(
        path => window.location.href.indexOf(path) > 0);
      section = paths.length > 0 ? '#' + paths[0] : '#home';
    }
    if (section === '#casino' || section === '#iorga' || section === '#boiron' || section === '#solutec' || section === '#conferences') {
      section = '#experience';
    }
    console.log(section)
    if (lastActiveSection && document.getElementById(lastActiveSection)) {
      document.getElementById(lastActiveSection).classList.remove("is-active");
    }
    if (document.getElementById(section)) {
      document.getElementById(section).classList.add("is-active");
    }
    lastActiveSection = section;
  }

  function loadLazyImages() {
    const images = document.getElementsByClassName('dm-img--lazyload');
    Array.from(images).forEach(function (image) {
      image.src = image.getAttribute('data-src')
    });
  }

  //let isBlogPage = document.currentScript.text.indexOf('blog=true')>-1;
  let lastActiveSection = window.location.hash;

  changeMenu(lastActiveSection);
  initSw();
  loadLazyImages();

  return {
    "changeMenu": changeMenu
  }
})();
