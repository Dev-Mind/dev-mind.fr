/* eslint-env browser */
window.blog = (function () {
  'use strict';

  /**
   * Parse the index, find the potential previous blog and update the view
   * @private
   */
  function sendMessage(target, page, title) {
    if ('twitter' === target) {
      document.location.href = `https://twitter.com/intent/tweet?original_referer=${encodeURI(page)}&text=${encodeURI(title) + ' @DevMindFr'}&tw_p=tweetbutton&url=${encodeURI(page)}`;
    }
    else if ('google+' === target) {
      document.location.href = `https://plus.google.com/share?url=${encodeURI(page)}&text=${encodeURI(title)}`;
    }
    else if ('linkedin' === target) {
      document.location.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(page)}&text=${encodeURI(title)}`;
    }
    else if ('facebook' === target) {
      document.location.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(page)}&description=${encodeURI(title)}`;
    }
  }

  return {
    // Send a message
    "sendSocial": sendMessage
  };
})();

