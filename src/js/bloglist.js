/* eslint-env browser */
window.blog = (function () {
  'use strict';

  let nbElementDisplayed = 0;
  const blogIndex = [];

  function init(pages) {
    pages.forEach(page => blogIndex.push(page));
  }

  function findMoreBlogpost() {
    nbElementDisplayed += 3;
    let extensionPoint = document.getElementById('dm_extension');

    // We clean up the firsts elements
    while (extensionPoint.firstChild) {
        extensionPoint.removeChild(extensionPoint.firstChild);
    }

    blogIndex
      .filter((e, index) => index <= nbElementDisplayed)
      .map((blogpost) => _getArticle(blogpost))
      .forEach(article => extensionPoint.appendChild(article));

    // If we have no more articles we hide the button
    if (nbElementDisplayed >= blogIndex.length) {
      document.getElementById('more-article').style.display = 'none';
    }
  }

  function _getArticle(blogpost, first) {
    const article = document.createElement("article");
    article.className = 'dm-blog--article';
    article.innerHTML = `
           <h2><a href="blog/${blogpost.dir}/${blogpost.filename}.html">${blogpost.doctitle}</a></h2>
           <div class="dm-blog--imgteaser"><img src="${blogpost.imgteaser}"/></div>
           <p class="dm-blog--teaser">${blogpost.teaser}</p>
    `;
    article.onclick = function () {
      document.location.href = `blog/${blogpost.dir}/${blogpost.filename}.html`;
    };
    return article;
  }

  function sendMessage(target) {
    const page = 'https://www.dev-mind.fr/blog.html';
    const title = 'le blog ' + ('twitter' === target ? '@DevMindFr' : 'Dev-Mind');

    if ('twitter' === target) {
      document.location.href = `https://twitter.com/intent/tweet?original_referer=${encodeURI(page)}&text=${encodeURI(title)}&tw_p=tweetbutton&url=${encodeURI(page)}`;
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
    // Display more Blogsposts
    "findMoreBlogpost": findMoreBlogpost,
    // Send a message
    "sendSocial": sendMessage,
    // Script init
    "init": init
  };
})();

