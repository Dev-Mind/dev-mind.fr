/* eslint-env browser */
window.app = (function() {
  'use strict';

  function initSw(){
    //console.log('init service worker with path ' + path);
    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin. Using a
    // service worker from an insecure origin will trigger JS console errors. See
    // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || isLocalhost)) {

      if(BroadcastChannel){
        const precacheUpdates = new BroadcastChannel('precache-updates');
        precacheUpdates.addEventListener('message', (event) => {
          console.debug(`${event.data} was updated. The new value will be used the next time a request is made.`);
        });
      }

      navigator.serviceWorker.register(`sw.js`).catch(function(e) {
          console.error('Error during service worker registration:', e);
      });
    }
  }

  function changeMenu(section){
    if(!section){
      if(window.location.href.indexOf('blog') > 0){
        section = '#blog';
      }
      else if(window.location.href.indexOf('experience') > 0){
        section = '#experience';
      }
      else{
        section = '#home';
      }
    }
    if(section === '#casino' || section === '#iorga' || section === '#boiron' || section === '#solutec' || section ==='#conferences'){
      section = '#experience';
    }
    if(lastActiveSection && document.getElementById(lastActiveSection)){
      document.getElementById(lastActiveSection).classList.remove("is-active");
    }
    if(document.getElementById(section)){
      document.getElementById(section).classList.add("is-active");
    }
    lastActiveSection = section;
  }

  function loadLazyImages() {
    const images = document.getElementsByClassName('dm-img--lazyload');
    Array.from(images).forEach(function(image){
      image.src= image.getAttribute('data-src')
    });
  }

  let isBlogPage = document.currentScript.text.indexOf('blog=true')>-1;
  let lastActiveSection = window.location.hash;

  changeMenu(lastActiveSection);
  initSw();
  loadLazyImages();
})();
