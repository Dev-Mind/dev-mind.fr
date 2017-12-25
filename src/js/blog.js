/* eslint-env browser */
window.blog = (function () {
  'use strict';

  let isDevPage = document.currentScript.text.indexOf('dev=true') > -1;

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
   * Loads the blog file index
   * @param cb
   * @param dirpath
   * @returns {Array}
   * @private
   */
  function _loadBlogIndex(cb) {
    //Data are load from localstorage if they are presents
    const data = localStorage.getItem("blogIndex");
    if(data){
      cb(_transformResult(JSON.parse(data)));
    }

    database
      .ref(isDevPage ? '/blogsDev' : '/blogs')
      .on('value', (snapshot) => {
        localStorage.setItem("blogIndex", JSON.stringify(snapshot.val()));
        cb(_transformResult(snapshot.val()));
      });
  }

  /**
   * Save the blog visit for stats
   */
  function _saveVisit(filename) {
    database
      .ref(`/stats${isDevPage ? 'Dev' : ''}/${filename}`)
      .transaction(count => {
        let result = count ? count + 1 : 1;
        document.getElementById('nbview').innerHTML = ` - lu ${result} fois`;
        return result;
      });
  }

  /**
   * Parse the index, find the potential previous blog and update the view
   * @param blogIndex
   * @param filename
   * @private
   */
  function findPreviousBlogpost(blogIndex, filename) {
    let previous;
    _saveVisit(filename);
    blogIndex
      .sort((a, b) => (a.strdate < b.strdate ? 1 : (a.strdate > b.strdate ? -1 : 0)))
      .forEach((elt, index, array) => {
        if (elt.filename === filename) {
          previous = index < array.length ? array[index + 1] : undefined;
          document.getElementById('blog-keywords').innerHTML = `${_getHtmlKeyword(elt, '-detail')}`;
        }
      });

    if (previous) {
      document.getElementById('previous-blogpost').innerHTML =
        `<div class="dm-blog--previous">Article précédent : <a href="../${previous.dir}/${previous.filename}.html">${previous.doctitle}</a></div>`;
    }

  }

  function findComments(filename) {
    database
      .ref(`${isDevPage ? '/commentsDev' : '/comments'}/${filename}`)
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

  function saveComment(filename) {
    const date = new Date();
    const form = document.forms['comment'];
    const timestamp = date.toISOString().replace(new RegExp(':', 'g'), '_').replace('.', '_');

    database
      .ref(`${isDevPage ? '/commentsDev' : '/comments'}/${filename}/${timestamp}`)
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

  /**
   * Formats the keywords
   * @param blogpost
   * @param suffix
   * @returns {*}
   */
  function _getHtmlKeyword(blogpost, suffix) {
    return blogpost.keywords
      .split(',')
      .map(keyword => `<span class="dm-blog--keyword${suffix}"><small>${keyword}</small></span>&nbsp;`)
      .reduce((a, b) => a + b);
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
    "findPreviousBlogpost": (filename) => _loadBlogIndex((blogIndex) => findPreviousBlogpost(blogIndex, filename)),
    // Display more Blogsposts
    "findMoreBlogpost": () => _loadBlogIndex((blogIndex) => findMoreBlogpost(blogIndex), 'blog'),
    // Send a message
    "sendSocial": sendMessage,
    // Form validation
    "onFormCommentChange": onFormCommentChange,
    // save comment
    "saveComment": saveComment,
    // Find comments
    "findComments": findComments,
    "displayCommentForm" : displayCommentForm
  };
})();

