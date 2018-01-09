const request = require('../node_modules/request');
const express = require('../node_modules/express');
const ejs = require('../node_modules/ejs');
const moment = require('../node_modules/moment');

const app = express();
app.set('view engine', 'ejs');
var router = express.Router();

const DARKSKY_APIKEY = "173a752b2b7c4553f07e3c7986ea8d99";
const ITASCA_GPS = {lat:41.9750, long:-88.0073};
const WEEKLY_DATA_URL = `https://api.darksky.net/forecast/${DARKSKY_APIKEY}/${ITASCA_GPS.lat},${ITASCA_GPS.long}?exclude=minutely,alerts,flags`;



function getSampleData(callback) {
  return callback(require('./sample-data.json'));
}

function packageData(rawData) {
  let data = {};
  //
  let current = {time:'', summary:'', icon:'', temperature:''};
  current.time = fromUnixTime(rawData.currently.time);
  current.summary = rawData.currently.summary;
  current.icon = rawData.currently.icon;
  current.temperature = Math.round(rawData.currently.temperature);
  data.current = current;
  //
  let hourly = {summary:'', icon:'', hourData:[]};
  hourly.summary = rawData.hourly.summary;
  hourly.icon = rawData.hourly.icon;
  rawData.hourly.data.forEach((e) => {
    hourly.hourData.push({
      time:fromUnixTime(e.time),
      summary:e.summary,
      icon:e.icon,
      temperature:Math.round(e.temperature)
    });
  });
  data.hourly = hourly;
  //
  let daily = {summary:'', icon:'', dayData:[]};
  daily.summary = rawData.daily.summary;
  daily.icon = rawData.daily.icon;
  rawData.daily.data.forEach((e) => {
    daily.dayData.push({
      time:fromUnixTime(e.time),
      summary:e.summary,
      icon:e.icon,
      temperatureLow:Math.round(e.temperatureLow),
      temperatureLowTime:fromUnixTime(e.temperatureLowTime),
      temperatureHigh:Math.round(e.temperatureHigh),
      temperatureHighTime:fromUnixTime(e.temperatureHighTime)
    });
  });
  data.daily = daily;
  //
  return data;
}

function processData(rawData) {
  console.log(`current:${fromUnixTime(rawData.currently.time)} ${rawData.currently.summary} ${rawData.currently.icon} ${rawData.currently.temperature}`);
  console.log(`hourly: ${rawData.hourly.summary} ${rawData.hourly.icon} `);
  rawData.hourly.data.forEach((e) => {
    console.log(`    ${fromUnixTime(e.time)} ${e.summary} ${e.icon} ${e.temperature}`);
  });
  console.log(`daily: ${rawData.daily.summary} ${rawData.daily.icon} `);
  rawData.daily.data.forEach((e) => {
    console.log(`    ${fromUnixTime(e.time)} ${e.summary} ${e.icon} ${e.temperatureLow} ${fromUnixTime(e.temperatureLowTime)} ${e.temperatureHigh} ${fromUnixTime(e.temperatureHighTime)}`);
  });
}

function testXX() {
  let options = {uri:WEEKLY_DATA_URL, method: 'GET', json: true};
  request(options, function(error, response, result) {
    if(error) {
      console.log("error:" + error);
    } else {
      //console.log(data);
      console.log(`current:${fromUnixTime(result.currently.time)} ${result.currently.summary} ${result.currently.icon} ${result.currently.temperature}`);
      console.log(`hourly: ${result.hourly.summary} ${result.hourly.icon} `);
      result.hourly.data.forEach((e) => {
        console.log(`    ${fromUnixTime(e.time)} ${e.summary} ${e.icon} ${e.temperature}`);
      });
      console.log(`daily: ${result.daily.summary} ${result.daily.icon} `);
      result.daily.data.forEach((e) => {
        console.log(`    ${fromUnixTime(e.time)} ${e.summary} ${e.icon} ${e.temperatureLow} ${fromUnixTime(e.temperatureLowTime)} ${e.temperatureHigh} ${fromUnixTime(e.temperatureHighTime)}`);
      });
    }
  });

}

function fromUnixTime(unixTime) {
  return moment.unix(unixTime).format('ddd, MMM D HH:mm');
}


function test() {
  getSampleData(processData);
}

//test();


//
router.get('/', (req, res) => {
  res.send('weatherdata');
});

router.get('/test', (req,res) => {
  res.render('weather_page', getSampleData(packageData));
});

//
app.use('/', router);
//
module.exports = app;
//

app.listen(3000, () => {
  console.log('weatherdata listening on port 3000!');
});

//console.log(moment.unix(1513576800).format("ddd, MMM D HH:mm"));
//console.log(WEEKLY_DATA_URL);