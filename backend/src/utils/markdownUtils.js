// backend/src/utils/markdownUtils.js
const marked = require('marked');

function convertMarkdownToHtml(markdown) {
  return marked(markdown);
}

module.exports = {
  convertMarkdownToHtml
};