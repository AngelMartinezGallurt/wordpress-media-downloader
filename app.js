import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.listen(port, () => {  
  console.log("Server running on port 3000...");
});

app.get('/', (req, res) => {
    res.render("index");
});

app.post('/', (req, res) => { 
  let media = req.body.media.split("\r\n");
  if (!fs.existsSync(path.join(__dirname, "public", "out"))) {
    fs.mkdirSync(path.join(__dirname, "public/out", "out"));
  }

  for (let i = 0; i < media.length; i++) {
    let fileName = media[i].split("/")[7];
    let year = media[i].split("/")[5];
    let month = media[i].split("/")[6];

    if (!fs.existsSync(path.join(__dirname, "public/out", year))) {
      fs.mkdirSync(path.join(__dirname, "public/out", year));
    }
    if (!fs.existsSync(path.join(__dirname, "public/out", year, month))) {
      fs.mkdirSync(path.join(__dirname, "public/out", year, month));
    }

    https.get(media[i], (mediaRes) => {
      let filepath = path.join(__dirname, "public/out", year, month, fileName);
      let writeStream = fs.createWriteStream(filepath);
      mediaRes.pipe(writeStream);
      writeStream.on('finish', () => {
        writeStream.close();
        console.log("Download complete!");
      });
    });
  }

});