/* eslint-env browser */

window.blog = (function() {
  'use strict';

  /**
   * Loads the blog file index
   * @param cb
   * @param dirpath
   * @returns {Array}
   * @private
   */
  function _loadBlogIndex(cb, dirpath){
    if(!self.fetch) {
      console.error("This website use the fetch API. You have to update your browser to be able to use this feature");
      return [];
    }
      console.log('rrrrrrrrrrrrrr', firebase)
    //limit nbElementDisplayed
    database.ref('/blogs').on('value', (snapshot) => console.log(snapshot.val()));

    fetch(`${dirpath ? dirpath : '..'}/blog-index.js`)
      .then((response) => response.json())
      .then((json) => cb(json));
  }

  /**
   * Parse the index, find the potential previous blog and update the view
   * @param blogIndex
   * @param filename
   * @private
   */
  function findPreviousBlogpost(blogIndex, filename){
    let previous;
    blogIndex
      .forEach((elt, index, array) => {
        if(elt.filename === filename){
          previous = index < array.length ? array[index + 1] : undefined;
          document.getElementById('blog-keywords').innerHTML= `${_getHtmlKeyword(elt, '-detail')}`;
        }
      });

    if(previous){
      document.getElementById('previous-blogpost').innerHTML=
        `<div class="dm-blog--previous">Article précédent : <a href="../${previous.dir}/${previous.filename}.html">${previous.doctitle}</a></div>`;
    }

  }

  /**
   * Formats the keywords
   * @param blogpost
   * @param suffix
   * @returns {*}
   */
  function _getHtmlKeyword(blogpost, suffix){
    return blogpost.keywords
      .split(',')
      .map(keyword => `<span class="dm-blog--keyword${suffix}"><small>${keyword}</small></span>&nbsp;`)
      .reduce((a, b) => a + b);
  }

  function _getArticle(blogpost, first){
    return `
         <article class="dm-blog--article${first ? '-head' : ''}" onclick="document.location.href='blog/${blogpost.dir}/${blogpost.filename}.html'">
              <${first ? 'h1' : 'h2'}><a href="blog/${blogpost.dir}/${blogpost.filename}.html">${blogpost.doctitle}</a></${first ? 'h1' : 'h2'}>
              <div class="dm-blog--imgteaser"><img src="${blogpost.imgteaser}"/></div>
              <p class="dm-blog--teaser">${blogpost.teaser}</p>
         </article>`;
  }

  function _getArticleList(blogpost, first){
    return `
        <tr><td class="dm-blog--shortcutlist"><a title="${blogpost.doctitle}" href="blog/${blogpost.dir}/${blogpost.filename}.html">${blogpost.doctitle}</a></td></tr>
        `;
    }

  /**
   * Find the last
   * @param blogIndex
   * @private
   */
  let nbElementDisplayed = 2;
  function findLastBlogpost(blogIndex){
    let articles = blogIndex
      .filter((e, index) => index < nbElementDisplayed && index > 0)
      .map((blogpost) => _getArticle(blogpost))
      .reduce((a,b) => a + b);

    let lastTenArticles = blogIndex
      .filter((e, index) => index < 10)
      .map((blogpost) => _getArticleList(blogpost))
      .reduce((a,b) => a + b);

    let headArticle = document.getElementById('last-article');
    let otherArticles = document.getElementById('last-articles');

    headArticle.innerHTML = _getArticle(blogIndex[0], true) + articles;
    headArticle.style.webkitTransform = 'scale(1)';
    otherArticles.innerHTML = `
      <table class="dm-blog--tenlastarticles">
        <thead>
            <tr><th>Derniers articles</th></tr>    
        </thead>
        <tbody>
            ${lastTenArticles}
        </tbody>
      </table>
      `;
    otherArticles.style.webkitTransform = 'scale(1)';

    if(nbElementDisplayed >= blogIndex.length){
      document.getElementById('more-article').style.display = 'none';
    }
  }

  function findMoreBlogpost(blogIndex){
    nbElementDisplayed +=2;
    findLastBlogpost(blogIndex);
  }

  function sendMessage(target, page, title){
    if('twitter' === target){
      document.location.href=`https://twitter.com/intent/tweet?original_referer=${encodeURI(page)}&text=${encodeURI(title) + ' @DevMindFr'}&tw_p=tweetbutton&url=${encodeURI(page)}`;
    }
    else if('google+' === target){
      document.location.href=`https://plus.google.com/share?url=${encodeURI(page)}&text=${encodeURI(title)}`;
    }
    else if('linkedin' === target){
      document.location.href=`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURI(page)}&text=${encodeURI(title)}`;
    }
    else if('facebook' === target){
      document.location.href=`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(page)}&description=${encodeURI(title)}`;
    }
  }

  let database;
  function _intializeFirebase(apiKey){
    console.log("connect")
    firebase.initializeApp({
      apiKey: apiKey,
      authDomain: "devmindblog.firebaseapp.com",
      databaseURL: "https://devmindblog.firebaseio.com",
      storageBucket: "devmindblog.appspot.com"
    });
    database = firebase.database();
  }

  return {
    // Initialize the database
    "intializeFirebase": _intializeFirebase,
    // Find and update the page to display a link to the previous blogpost
    "findPreviousBlogpost": (filename) => _loadBlogIndex((blogIndex) => findPreviousBlogpost(blogIndex, filename)),
    // Display the last written blogpost
    "findLastBlogpost": () => _loadBlogIndex((blogIndex) => findLastBlogpost(blogIndex), 'blog'),
    // Display more Blogsposts
    "findMoreBlogpost": () => _loadBlogIndex((blogIndex) => findMoreBlogpost(blogIndex), 'blog'),
    // Send a message
    "sendSocial": sendMessage
  };
})();


