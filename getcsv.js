// package (https://www.npmjs.com/package/isomorphic-fetch)
// - provides an implementation of the fetch API compatible with Nodejs
// $ npm install isomorphic-fetch

const fetch = require('isomorphic-fetch');

// package (https://nodejs.org/api/fs.html)
// - provides a utility for manipulating system files
// npm install fs
const fs = require('fs');

// package (https://nodejs.org/api/path.html)
// - fournit: un utilitaire de manipulation des chemins systèmes
// npm install --save path

const path = require('path');

// created a folder to store the downloaded files
const PATH_FOLDER_DOWNLOAD = path.join(__dirname, "./files");

if(!fs.existsSync(PATH_FOLDER_DOWNLOAD)) {
    // if the download folder does not exist we create it
    fs.mkdirSync(PATH_FOLDER_DOWNLOAD);
}

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
