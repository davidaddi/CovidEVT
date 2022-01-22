// package (https://nodejs.org/api/fs.html)
// - provides a utility for manipulating system files
// $ npm install fs
var fs = require('fs');

const mt = require("./mainTweet"); // from mainTweet.js 
const rp = require("./Reply"); // from Reply.js

function one() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      mt.getData(); 
      console.log(' 📧 Main message tweeted! ');
      resolve();
    }, 3000);
  })
}

function two() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      rp.Reply(); 
      console.log(' 📧 Main message tweeted! ');
      resolve();
    }, 3000);
  })
}


one().then(two)
