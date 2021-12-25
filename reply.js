// package (getcsv.js)
// - permet d'obtenir la date d'aujourd'hui & de télécharger un fichier csv puis le convertir en JSON 

// const getTDDate = require('./getTDDate'); 
// const myModule = require('./getCSV'); 

// package (https://www.npmjs.com/package/twit)
// - permet d'accéder aux différentes fonctions de Twitter depuis un script/terminal
// $ npm twit

var Twit = require('twit');
const fetch = require("node-fetch");
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

const FetchURL = `https://static.data.gouv.fr/resources/donnees-relatives-aux-personnes-vaccinees-contre-la-covid-19-1/20211221-212503/vacsi-tot-fra-${(new Date()).toISOString().slice(0,10)}-21h25.json`;

async function Reply() {
  fetch(FetchURL)
  .then(reponse => reponse.json()) 
          .then(data => {
            T.post('statuses/update', {
              status: '🗓️ Évolution des vaccinations ' +
                          ": \n 💉 Nouvelles premières doses :" + data[0].n_tot_dose1.toLocaleString() + 
                          " \n 💉💉 Nouvelles deuxième doses : " + data[0].n_tot_rappel.toLocaleString() +
                          '\n 💉💉💉 Nouvelles troisième doses : ' + data[0].n_tot_complet.toLocaleString() +
                          '\n\n 🇫🇷 Couverture vaccinale ' + data[0].couv_tot_dose1,
              in_reply_to_status_id: '1472259952467136513'
            }, function (err, data, response) {
              if (err) {
                console.log(err)
              } else {
                console.log(data.text)
              }
          })
          })
  };

Reply(); 