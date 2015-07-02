var express = require('express');
var path = require('path');
var coloredcoins = require('./coloredcoins');
var app = express();
app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
app.listen(port);
console.log("App listening on port " + port);

app.get('/assetmetadata/:assetId/:utxo', coloredcoins.assetmetadata);
app.get('/addressinfo/:address', coloredcoins.addressinfo);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public'));
});

