var request = require('request');

var apiHost = 'testnet.api.coloredcoins.org';

var getFrom = function (api_endpoint, param, expressResponse) {
  request.get('http://' + apiHost + ':80/v2/' + api_endpoint + '/' + param, function(error, response, body) {
    expressResponse.set(response.headers).status(response.statusCode).send(body).end();
  });
};

module.exports.assetmetadata = function(req, res) {
  getFrom('assetmetadata', req.params.assetId + "/" + req.params.utxo, res);
};

module.exports.addressinfo = function(req, res) {
  getFrom('addressinfo', req.params.address, res);
};