require('isomorphic-fetch')
const converterCsvToJson = require("csvtojson");
const fs = require('fs');
const path = require('path');
const PATH_FOLDER_DOWNLOAD = path.join(__dirname, "./files");
 
if(!fs.existsSync(PATH_FOLDER_DOWNLOAD)) {
    fs.mkdirSync(PATH_FOLDER_DOWNLOAD);
}
 
const TIME_DOWNLOAD_INTERVAL = ((1_000 * 60) * 60) * 24; // 24 hours
const downloadRid = setInterval(onDownload, TIME_DOWNLOAD_INTERVAL);
 
async function onDownload() {
 
    const response = await fetch('https://www.data.gouv.fr/api/2/datasets/6010206e7aa742eb447930f7/resources/?page=1&type=main&page_size=1', {
        method: "GET"
    });
 
    const data = await response.json();
    // console.log(data)

    const lastItem = data => {
        data.data[0]
    }

    const integrity = lastItem => {
        lastItem.checksum.value;
    }

    const filenames = fs  => {
        fs.readdirSync(PATH_FOLDER_DOWNLOAD, {encoding: "utf-8"});
    }

    const exists = filenames => {
        find.filename.indexOf(integrity) !== -1;
    }
 
    if(exists) {
        const {published} = lastItem;
        console.log(`opération annulée, aucun fichier à été publié depuis le: ${published}`);
 
    } else {
        const urlCsvFile = lastItem.url;
        const response = await fetch(urlCsvFile, {method: "GET"});
        const csvContent = await response.text();
 
        fs.writeFileSync(
            path.join(PATH_FOLDER_DOWNLOAD, (integrity + ".csv")),
            csvContent,
            {encoding: "utf-8"}
        ); 
        const json = await converterCsvToJson().fromString(csvContent);
        console.log(json);
    }
}

onDownload();