/*
 * doctools.js
 * Tools to quickly edit the document like innerHTML and style
 */

module.exports.setInnerHTML = function(id, html) {
  document.getElementById(id).innerHTML = html;
};

module.exports.setStyle = function(id, style, value) {
  document.getElementById(id).style[style] = value;
};