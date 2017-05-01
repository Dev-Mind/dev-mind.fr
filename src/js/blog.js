/* eslint-env browser */
window.blog = (function() {
  'use strict';

  /**
   * Loads the blog file index
   * @param cb
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
        }
      });

    if(previous){
      document.getElementById('previous-blogpost').innerHTML=
        `<a href="../${previous.dir}/${previous.filename}.html">${previous.doctitle}</a>`;
    }
  }

  /**
   * Find the last
   * @param blogIndex
   * @private
   */
  var nbElementDisplayed = 2;

  function findLastBlogpost(blogIndex){
    document.getElementById('last-article').innerHTML= blogIndex
      .filter((e, index) => index < nbElementDisplayed)
      .map((blogpost) => {
        const keywords = blogpost.keywords
          .split(',')
          .map(keyword => `<span class="dm-blog--keyword">${keyword}</span>&nbsp;`)
          .reduce((a, b) => a + b);

        return `
         <article class="dm-blog--article" onclick="document.location.href='blog/${blogpost.dir}/${blogpost.filename}.html'">
              <h2>${blogpost.doctitle}</h2>
              <div class="dm-blog--info">${blogpost.revdate} ${keywords}</div>
              <div class="dm-blog--imgteaser"><img src="${blogpost.imgteaser}"/></div>
              <p class="dm-blog--teaser">${blogpost.teaser}</p>
         </article>`;
      })
      .reduce((a,b) => a + b);

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


