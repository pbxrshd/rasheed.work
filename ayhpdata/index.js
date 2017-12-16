const request = require('../node_modules/request');
const cheerio = require('../node_modules/cheerio');
const express = require('../node_modules/express');
const app = express();
var router = express.Router();
//
const CONTENT_URL = "http://alhudayouthprogram-data.blogspot.com/p/{pn}.html";
const PHOTOS_URL = "https://picasaweb.google.com/data/feed/base/user/103669831595641751516/albumid/6251145611690670289?alt=json&kind=photo&prettyprint=false&fields=entry/content";
//
router.get('/', (req, res) => {
  res.send('ahyp data feed');
});
//
router.get('/cmsdata/:cb/:pn', (req, res) => {
  var callback = req.params.cb;
  var pagename = req.params.pn;
  var url = CONTENT_URL.replace("{pn}", pagename);
  var content = "";
  request(url, (error, response, html) => {
    if(!error){
        var $ = cheerio.load(html);
        content = $("#cms_content").html();
        res.send(callback + "(\"" + encodeURI(content) + "\")");
    } else {
      console.log("error...");
    }
  });
});
//
router.get('/cmsphotos/:cb', (req, res) => {
  var callback = req.params.cb;
  var content = "";
  request(PHOTOS_URL, (error, response, body) => {
    if(!error){
        res.send(callback + "(" + body + ")");
    } else {
      console.log("error...");
    }
  });
});
//
app.use('/', router);
//
module.exports = app;
//

// uncomment to run this app standalone
/*
app.listen(3000, function () {
  console.log('ayhpdata standalone listening on port 3000!');
})
*/