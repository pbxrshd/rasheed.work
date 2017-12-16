var express = require('../node_modules/express');
var app = express();

// these are the sub apps
var ayhpdata = require('../ayhpdata/index');

// mount sub apps
app.use('/ayhpdata', ayhpdata);

// home page for rasheed.work
app.get('/', (req, res) => {
  res.send('main1 slash');
});

// static file server
app.get('/public/*', (req, res) => {
  var path = req.params[0];
  if (path.indexOf('..') === -1) { // don't allow peeking anywhere else
    return res.sendFile(__dirname + '/public/' + path);
  } else {
    res.status = 404;
    return res.send('Not Found');
  }
});


app.listen(8081, () => {
  console.log('Main host app listening internally on port 8081!');
});