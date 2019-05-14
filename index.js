/**
 * Server side code with api routes for converting ros file to csv
 * Author: Divya Agarwal
 * 
 * Ref: https://github.com/cruise-automation/rosbag.js
 */

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const rosbag = require('rosbag');
var converter = require('json-2-csv');
var fs = require('fs');
const path = require('path');
const port = 3000
var inputFileName

// callback function for json2csv
var json2csvCallback = function (err, csv) {
  if (err) console.log(err);
  fs.writeFile('output/outfile.csv', csv, function(err) {
      if (err) throw err;
      console.log('Output csv file was saved in the Output folder\n\n');
    });
};

app.use(fileUpload());

/** routes **/

// home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view.html'));

});

// upload file route
app.post('/api/upload', (req, res) => {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
      }
      // The name of the input field "sampleFile" is used to retrieve the uploaded file
      let sampleFile = req.files.sampleFile;
      console.log(sampleFile.name);
      inputFileName = sampleFile.name

      // Use the mv() method to place the file somewhere on your server/localhost
      sampleFile.mv(`./uploads/${sampleFile.name}`, function(err) {
        if (err)
          return res.status(500).send(err);

      // create new file for writing bag info

      var outputDir = 'output'
      if (!fs.existsSync(path.join(__dirname, outputDir))){
        fs.mkdirSync(outputDir);
      } 

      fs.open(path.join(__dirname, outputDir) + '/baginfo_' + inputFileName +'.txt', 'w', function (err, file) {
        if (err) throw err;
        console.log('Bag Info file created!');
      });
      
      // convert the read rosbag file to csv
      const bagOpen = rosbag.open(`./uploads/${sampleFile.name}`);

      bagOpen.then((bag) => {
        console.log("\nNumber of topics in the bag: "+ Object.keys(bag.connections).length); 
        fs.appendFileSync('output/baginfo_' + inputFileName +'.txt', "\nNumber of topics in the bag: "+ Object.keys(bag.connections).length +"\r\n", 'utf8');

        // loop over values to get bag topics
        var bagTopics = [];
        for (let value of Object.values(bag.connections)) {
            bagTopics.push(value.topic);
            console.log(value.topic); 

            fs.appendFileSync('output/baginfo_' + inputFileName +'.txt', value.topic +"\r\n", 'utf8');
        }

        // UNCOMMENT below: convert the data to CSV format
        // converter.json2csv((bag.connections), json2csvCallback);

        // extract messages for each topic and append to txt file (temp hack)
        if(bagTopics.length >= 2){
          bag.readMessages({topics: [bagTopics[1]] }, (result) => {
            // console.log(result.topic);
            // console.log(result.message);
            });
        }

      }).catch(err=>{
        console.log('\nSomething went wrong..');
        console.log(err);
      });

      // send a success response back 
      res.send('File uploaded!');
      });
});

// begin server
app.listen(process.env.PORT || port, () => {
    console.log('server running...');
});

