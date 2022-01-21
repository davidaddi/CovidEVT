// package (https://nodejs.org/api/fs.html)
// - provides a utility for manipulating system files
// $ npm install fs
var fs = require('fs');

const mt = require("./mainTweet"); // from mainTweet.js 
const rp = require("./Reply"); // from Reply.js



async function sendTweet(err, data) {
    if (err) {
      console.log(err)
    } else {
        mt.getData(); 
        console.log(' 📧 Main message tweeted! ');
        await new Promise(resolve => setTimeout(resolve, 1000));
        rp.Reply();
        console.log(' ✅ Reply tweeted!')
        await new Promise(resolve => setTimeout(resolve, 1000))
        fs.unlink('files/data.csv', function (err) {
          if (err) throw err;
          console.log(' 🗑️ File deleted!');
        });
    }
} 

sendTweet(); 
