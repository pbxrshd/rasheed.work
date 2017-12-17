const express = require('../node_modules/express');
const app = express();
const router = express.Router();

// these are the sub apps
var ahypdata = require('../ahypdata/index');

// mount sub apps
app.use('/ahypdata', ahypdata);

// home page for rasheed.work
router.get('/', (req, res) => {
  res.send('main server');
});

// static file server
router.get('/public/*', (req, res) => {
  var path = req.params[0];
  if (path.indexOf('..') === -1) { // don't allow peeking anywhere else
    return res.sendFile(__dirname + '/public/' + path);
  } else {
    res.status = 404;
    return res.send('Not Found');
  }
});

//
app.use('/main', router);
//
module.exports = app;
//
app.listen(8081, () => {
  console.log('Main host app listening internally on port 8081!');
});