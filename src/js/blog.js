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
    fetch(`${dirpath ? dirpath : '..'}/blog-index.json`)
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
    return first ? `
         <article class="dm-blog--article-head" onclick="document.location.href='blog/${blogpost.dir}/${blogpost.filename}.html'">
              <h1><a href="blog/${blogpost.dir}/${blogpost.filename}.html">${blogpost.doctitle}</a></h1>
              <div class="dm-blog--info">
                <div class="dm-blog--info-date"><small>${blogpost.revdate}</small></div>
                <div class="dm-blog--info-keyword">${_getHtmlKeyword(blogpost, '')}</div>
              </div>
              <div class="dm-blog--imgteaser"><img src="${blogpost.imgteaser}"/></div>
              <p class="dm-blog--teaser">${blogpost.teaser}</p>
         </article>` : `
         <article class="dm-blog--article" onclick="document.location.href='blog/${blogpost.dir}/${blogpost.filename}.html'">
              <h2><a href="blog/${blogpost.dir}/${blogpost.filename}.html">${blogpost.doctitle}</a></h2>
              <div class="dm-blog--info">
                <div class="dm-blog--info-date"><small>${blogpost.revdate}</small></div>
                <div class="dm-blog--info-keyword">${_getHtmlKeyword(blogpost, '')}</div>
              </div>
              <div class="dm-blog--imgteaser"><img src="${blogpost.imgteaser}"/></div>           
              <p class="dm-blog--teaser">${blogpost.teaser}</p>
         </article>`;
  }

  /**
   * Find the last
   * @param blogIndex
   * @private
   */
  let nbElementDisplayed = 4;
  function findLastBlogpost(blogIndex){
    let articles = blogIndex
      .filter((e, index) => index < nbElementDisplayed && index > 0)
      .map((blogpost) => _getArticle(blogpost))
      .reduce((a,b) => a + b);

    document.getElementById('last-article').innerHTML = _getArticle(blogIndex[0], true) + articles;

    if(nbElementDisplayed >= blogIndex.length){
      document.getElementById('more-article').style.display = 'none';
    }
  }

  function findMoreBlogpost(blogIndex){
    nbElementDisplayed +=2;
    findLastBlogpost(blogIndex);
  }

  return {
    // Find and update the page to display a link to the previous blogpost
    "findPreviousBlogpost": (filename) => _loadBlogIndex((blogIndex) => findPreviousBlogpost(blogIndex, filename)),
    // Display the last written blogpost
    "findLastBlogpost": () => _loadBlogIndex((blogIndex) => findLastBlogpost(blogIndex), 'blog'),
    // Display more Blogsposts
    "findMoreBlogpost": () => _loadBlogIndex((blogIndex) => findMoreBlogpost(blogIndex), 'blog')
  };
})();


