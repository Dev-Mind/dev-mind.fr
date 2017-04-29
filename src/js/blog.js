/* eslint-env browser */
var blog = (function() {
  'use strict';

  /**
   * Loads the blog file index
   * @param cb
   * @returns {Array}
   * @private
   */
  function _loadBlogIndex(cb){
    if(!self.fetch) {
      console.error("This website use the fetch API. You have to update your browser to be able to use this feature");
      return [];
    }
    fetch('../blog-index.json')
      .then((response) => response.json())
      .then((json) => cb(json));
  }

  /**
   * Parse the index, find the potential previous blog and update the view
   * @param blogIndex
   * @param filename
   * @private
   */
  function _parseAndFindPreviousBlogpost(blogIndex, filename){
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
   * Find and update the page to display a link to the previous blogpost
   */
  function findPreviousBlogpost(filename){
      _loadBlogIndex((json) => _parseAndFindPreviousBlogpost(json, filename));
   // "previous-blogpost"
  }

  return {
    "findPreviousBlogpost": findPreviousBlogpost
  };
})();


