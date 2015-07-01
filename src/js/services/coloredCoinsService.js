'use strict';

angular.module('copayApp.services')
	.factory('coloredCoinsService', function($log, $http) {
		var root = {};
		var apiHost = 'testnet.api.coloredcoins.org';

		var handleResponse = function (data, status, cb) {
			$log.debug('Status: ', status);
			$log.debug('Body: ', JSON.stringify(data));

			if (status != 200 && status != 201) {
				return cb(data);
			}
			return cb(null, body);
		};

		var getFrom = function (api_endpoint, param, cb) {
			$log.debug('Get from:' + api_endpoint + '/' + param);
			$http.get('http://' + apiHost + ':80/v2/' + api_endpoint + '/' + param)
				.success(function (data, status) {
					return handleResponse(data, status, cb);
				})
				.error(function(data, status) {
					return handleResponse(data, status, cb);
				});
		};

		var extractAssets = function(body) {
			var assets = [];
			if (body.utxos.length == 0) return assets;

			body.utxos.forEach(function(utxo) {
				if (utxo.assets.length > 0) {
					utxo.assets.forEach(function(asset) {
						assets.push({ assetId: asset.assetId, amount: asset.amount, utxo: utxo.txid + ':' + utxo.index });
					});
				}
			});

			return assets;
		};

		var getMetadata = function(asset, cb) {
			getFrom('assetmetadata', asset.assetId + "/" + asset.utxo, function(err, body){
				if (err) { return cb(err); }
				return cb(null, body.metadataOfIssuence);
			});
		};

		var getAssetsByAddress = function(address, cb) {
			getFrom('addressinfo', address, function(err, body) {
				if (err) { return cb(err); }
				return cb(null, extractAssets(body));
			});
		};

		root.getAssets = function(address, cb) {
			getAssetsByAddress(address, function(err, assetsInfo) {
				if (err) { return cb(err); }

				$log.debug("Assets for " + address + ": \n" + JSON.stringify(assetsInfo));

				var assets = [];
				assetsInfo.forEach(function(asset) {
					getMetadata(asset, function(err, metadata) {
						metadata.amount = asset.amount;
						assets.push({ asset: asset, metadata: metadata });
						if (assetsInfo.length == assets.length) {
							return cb(assets);
						}
					});
				});
			});
		};

		return root;
	});
