// package (https://nodejs.org/api/fs.html)
// - provides a utility for manipulating system files
// $ npm install fs
var fs = require('fs');

// package (https://www.npmjs.com/package/twit)
// - provides you to access the different functions of Twitter from a terminal
// $ npm install twit
var Twit = require('twit');

// package (https://www.npmjs.com/package/dotenv)
// provides to load environment variables from an .env file
// $ npm install dotenv
require('dotenv').config();

var file = 'files/data.csv';
var content = fs.readFileSync(file, "utf8");

// initialize connections to twitter
var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_SECRET,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});


module.exports.Reply = async function Reply() {


  fs.readFile('./files/data.csv', 'utf-8', function(err, data) {
    if (err) throw err;

    var lines = data.trim().split('\n');
    var lastLine = lines.slice(-1)[0];

    var fields = lastLine.split(',');
    var exportLine = fields.slice(-1)[0].replace('file:\\\\', '');

    array = exportLine.split(';');
});


  // search last tweet of the account
  var params = {screen_name: 'covidevt', count: 1}; 
  T.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      // Reply to the main tweet using previous scrapped datas
      T.post('statuses/update', { 
        status: '🗓️ Évolution des vaccinations ' +
                    ": \n\n💉 Nouvelles premières doses : " + parseInt(array[2]).toLocaleString() + 
                    " \n 💉💉 Nouvelles deuxième doses : " + parseInt(array[4]).toLocaleString() +
                    '\n 💉💉💉 Nouvelles troisième doses : ' + parseInt(array[3]).toLocaleString() +
                    '\n🇫🇷 💉 Couverture vaccinale : ' + array[8] +'%',
        in_reply_to_status_id: tweets[0].id_str
    }, function (err, data, response) {
        if (err) {
          console.log(err)
        } else {
          // console.log(data.text + ' tweeted!')
        }
      })
    }
  });
}

// Reply()
