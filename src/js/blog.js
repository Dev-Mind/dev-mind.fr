/* eslint-env browser */
window.blog = (function () {
  'use strict';

  firebase.initializeApp({
    apiKey: "AIzaSyDDNQD2TvIlEM4J6zRaRUEr9NTySfSzPuI",
    authDomain: "devmindblog.firebaseapp.com",
    databaseURL: "https://devmindblog.firebaseio.com",
    storageBucket: "devmindblog.appspot.com"
  });

  let database = firebase.database();

  /**
   * Converts result to an array
   * @param index
   * @returns {Array}
   * @private
   */
  function _transformResult(index) {
    if (index) {
      return Object.keys(index).map(key => index[key]);
    }
    return [];
  }

  /**
   * Save the blog visit for stats
   */
  function _saveVisit(filename, modeDev) {
    console.log(`database = /stats${modeDev ? 'Dev' : ''}/${filename}`)
    database
      .ref(`/stats${modeDev ? 'Dev' : ''}/${filename}`)
      .transaction(count => {
        let result = count ? count + 1 : 1;
        document.getElementById('nbview').innerHTML = ` - lu ${result} fois`;
        return result;
      });
  }

  /**
   * Parse the index, find the potential previous blog and update the view
   * @private
   */
  function init(filename, modeDev) {
    _findComments(filename, modeDev);
    _saveVisit(filename, modeDev);
  }

  /**
   * @private
   */
  function _findComments(filename, modeDev) {
    database
      .ref(`${modeDev ? '/commentsDev' : '/comments'}/${filename}`)
      .startAt()
      .on('value', (snapshot) => {
        if (snapshot.val()) {
          let comments = _transformResult(snapshot.val())
            .sort((a, b) => (a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp ? 1 : 0)))
            .map((comment) => `
                <article class="dm-blog--comment">
                    <div class="head"><b>${comment.name}</b> : ${comment.date}</div> 
                    <div class="comment">${comment.comment}</div>
                </article>
            `)
            .reduce((a, b) => a + b);

          document.getElementById('comments').innerHTML = `${comments}`;
        }
        else{
          document.getElementById('comments').innerHTML = `Pas de commentaire pour le moment`;
        }
      })
  }

  function formValidate() {
    const form = document.forms['comment'];
    return (form.name.value.trim().length !== 0 && form.comment.value.trim().length !== 0);
  }

  function onFormCommentChange() {
    if (formValidate()) {
      document.getElementById('saveComments').disabled = false;
    }
    else {
      document.getElementById('saveComments').disabled = true;
    }
  }

  let commentVisibility = 'none';
  function displayCommentForm() {
    commentVisibility = commentVisibility === 'block' ? 'none' : 'block';
    document.getElementById('commentFrm').style.display = commentVisibility;
  }

  function saveComment(filename, modeDev) {
    const date = new Date();
    const form = document.forms['comment'];
    const timestamp = date.toISOString().replace(new RegExp(':', 'g'), '_').replace('.', '_');

    database
      .ref(`${modeDev ? '/commentsDev' : '/comments'}/${filename}/${timestamp}`)
      .set({
        timestamp: timestamp,
        date: date.toLocaleString('fr'),
        name: form.name.value.trim(),
        comment: form.comment.value.trim(),
        mail: form.mail.value.trim()
      })
      .then(() => {
        form.name.value = '';
        form.comment.value = '';
        form.mail.value = '';
        // send a notification
        displayCommentForm();
      });
    return false;
  }

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
    // Find and update the page to display a link to the previous blogpost
    "init": init,
    // Send a message
    "sendSocial": sendMessage,
    // Form validation
    "onFormCommentChange": onFormCommentChange,
    // save comment
    "saveComment": saveComment,
    // Find comments
    "displayCommentForm" : displayCommentForm
  };
})();

