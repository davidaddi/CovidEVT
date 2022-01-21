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

// on initialise les connections à twitter

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_SECRET,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

// set the date parameters to display it in French format

var date = new Date();
const yesterday = new Date(date)
yesterday.setDate(yesterday.getDate() - 1) // obternir la date du jour précédent
var options = {weekday: "long", year: "numeric", month: "long", day: "2-digit"};


// DATA RECOVERY (API -> https://coronavirusapifr.herokuapp.com/data/live/france)
// Tweet the main tweet
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

// getData();
