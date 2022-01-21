<h1> Introduction </h1>
🤖 CovidEVT is a Twitter bot that relies on data provided by the French government to tweet different statistics about the evolution of Covid-19 every day 
(based on Node.js).

🕊️ Here is the link of the bot : https://twitter.com/covidevt

<h3> mainTweet.js </h3>
We're starting by initializing the different Node modules for our code.

<pre>
// package (https://www.npmjs.com/package/twit)
// - provides you to access the different functions of Twitter from a terminal
// $ npm install twit
var Twit = require('twit');

// package (https://www.npmjs.com/package/node-fetch)
// - bring the Fetch API to node.js
// $ npm install node-fetch
const fetch = require("node-fetch");

// package (https://www.npmjs.com/package/dotenv)
// provides to load environment variables from an .env file
// $ npm install dotenv
require('dotenv').config();
</pre>

Then we initialise the connections to Twitter using account's log (saved in a .env file)

<pre>
var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_SECRET,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});
</pre>

Now we set a variable corresponding to the date of the previous day (d-1) by displaying it with a String format (textual date used in the final tweet) 
<pre>
var date = new Date();
const yesterday = new Date(date)
yesterday.setDate(yesterday.getDate() - 1) // obternir la date du jour précédent
var options = {weekday: "long", year: "numeric", month: "long", day: "2-digit"};
</pre>

Once the date is setted, we can fetch the first API (which list "general" statistics about COVID-19)

<pre>
module.exports.getData = async function getData() {
    fetch('https://coronavirusapifr.herokuapp.com/data/live/france')
    .then(reponse => reponse.json()) 
            .then(data => {
                T.post('statuses/update', // T.post() == send tweet
                    { status: 'Le ' + yesterday.toLocaleDateString("fr-FR", options)  +
                            ": \n 😷 Nombre de cas : " + data[0].conf_j1.toLocaleString()+ 
                            " \n 🏥 Nombre d'hospitalisations : " + data[0].hosp.toLocaleString() + " (" + data[0].incid_hosp + ' nouvelles hospitalisations)' +
                            '\n 🚑 Nombre de cas en réanimation : ' + data[0].rea.toLocaleString() + " (" + data[0].incid_rea + ' nouvelles réanimations)' +
                            "\n ⚰️Nombre de décès : " + data[0].dc_tot.toLocaleString() +
                            //"\n Tension hospitalière : " + ((parseFloat(data[0].TO)) * 100) + '%' +
                            "\n ⬇️ VACCIN ⬇️ "
                            
                            }, function(err, data, response) {
                    //console.log(data)
                })
            })
    };
</pre>

<h3> getcsv.js </h3>

The previous API didn't provide any data about vaccination and as I couldn't find any API giving me access to French data, 
I had to fall back on a <a href="https://www.data.gouv.fr/fr/datasets/donnees-relatives-aux-personnes-vaccinees-contre-la-covid-19-1/">dataset</a> (api.gouv) provided in csv format and actualised each day.

The web page makes a request to this <a href="https://www.data.gouv.fr/api/2/datasets/6010206e7aa742eb447930f7/resources/?page=1&type=main&page_size=6">endpoint</a> to get the last 6 data (in JSON format).
Here we need the most recent data you should be able to pass the parameter <code>page_size=1</code> instead of <code>page_size=6</code>

To have in the end : 
<code>GET https://www.data.gouv.fr/api/2/datasets/6010206e7aa742eb447930f7/resources/?page=1&type=main&page_size=1</code>

Where to get the URL of the most recent CSV file you need:

<code>data[0].url</code>

Once we have the url's, we start by creating a folder path using this, if the download folder does not exist we create it : 

<pre>
const PATH_FOLDER_DOWNLOAD = path.join(__dirname, "./files");

if(!fs.existsSync(PATH_FOLDER_DOWNLOAD)) {
    fs.mkdirSync(PATH_FOLDER_DOWNLOAD);
}
</pre>

Once the folder setted, we can build a function. We start to get the last file and we check if the file is not already owned, 
using a hash to uniquely identify the data, and then we download the file.

<pre>
async function onDownload() {
    // get the link of the last CSV file
    const response = await fetch('https://www.data.gouv.fr/api/2/datasets/6010206e7aa742eb447930f7/resources/?page=1&type=main&page_size=1', {
        method: "GET"
    });

    const data = await response.json();
    // console.log(data)

    const lastItem = data.data[0];

    // check if the file is not already owned, using a hash to uniquely identify the data
    const integrity = 'data';

    // Using simple `fs.readdirSync` would give you filenames as well as directories.
    // This approach creates objects called `Dirent`s where you can check if the the entry is a file or a directory.
    // Then you can simply filter out the directories and get the filenames.
    const filenames = fs.readdirSync(PATH_FOLDER_DOWNLOAD, {withFileTypes: true, encoding: "utf-8"})
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

    // Check if some of the filenames contains the integrity hash
    const exists = filenames.some(filename => filename.indexOf(integrity) !== -1);

    // we already have this file it has not been updated yet we give up the operation
    if(exists) {
        const {published} = lastItem;
        console.log(`operation cancelled, no file has been published since: ${published}`);

    } else {
        // we don't own this file we download it
        const urlCsvFile = lastItem.url;
        const response = await fetch(urlCsvFile, {method: "GET"});
        const csvContent = await response.text();

        // writes the new file to the download folder
        // using the hash as the file name, which will allow later to check if you already have it

        fs.writeFileSync(
            path.join(PATH_FOLDER_DOWNLOAD, (integrity + ".csv")),
            csvContent,
            {encoding: "utf-8"}
        );

        // the CSV file has been downloaded and saved in a file at: /download/{hash}.csv
        console.log(' ✅ File downloaded!')
    }
}

onDownload();
</pre>

<h3>Reply.js</h3>
Once again, we start by requiring Node modules and initialize the connections to Twitter account.

<pre>
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
</pre>

The next thing to do is to read the csv file, select the last line and assign it to a variable (all in a function) :
<pre>
module.exports.Reply = async function Reply() {


  fs.readFile('./files/data.csv', 'utf-8', function(err, data) {
    if (err) throw err;

    var lines = data.trim().split('\n');
    var lastLine = lines.slice(-1)[0];

    var fields = lastLine.split(',');
    var exportLine = fields.slice(-1)[0].replace('file:\\\\', '');

    array = exportLine.split(';');
});
</pre>

The twit.js package integrates a Reply function which needs to get the targeted tweet id. So we use this request to get it : 
<pre>
// search last tweet of the account
  var params = {screen_name: 'covidevt', count: 1}; 
  T.get('statuses/user_timeline', params, function(error, tweets, response) {
</pre>

We save all informations about the last tweet (user, id ...) in a variable called tweet. 
At the end, we just have to use the line <code> in_reply_to_status_id: tweets[0].id_str</code>

And, if we don't get any errors, we can tweet once again using the values of the csv file previously parsed : 

<pre>
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
</pre>

<h3> index.js </h3>

I made the choice to create separate functions in separate files and compile them all in one index.js file. All the function are exported with : 
<code> module.exports.$nameOfFunction = function ... </code>

Like that, we just need to import them with

<pre>
var fs = require('fs');
const mt = require("./mainTweet"); // from mainTweet.js 
const rp = require("./Reply"); // from Reply.js
</pre>

To finally send the Tweet : 

<pre>
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

</pre>
