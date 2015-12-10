'use strict';

angular.module('copayApp.services').factory('walletService', function(profileService, coloredCoins, lodash, configService, $log, $rootScope, go) {
  var root = {};

  root.btcBalance = null;
  root.walletAsset = null;
  root.totalAssetBalanceStr = null;
  root.isAssetWallet = null;

  var updateAssetBalance = function() {
    if (!root.walletAsset) {
      root.totalAssetBalanceStr = null;
      root.walletUnit = null;
      return;
    }

    var assets = lodash.filter(coloredCoins.assets, function(asset) {
      return asset.assetId == root.walletAsset;
    });

    var coloredBalance = lodash.reduce(assets, function(total, asset) {
      total += asset.asset.amount;
      return total;
    }, 0);

    root.walletUnit = coloredCoins.getAssetSymbol(root.walletAsset, assets[0]);

    root.totalAssetBalanceStr = coloredCoins.formatAssetAmount(coloredBalance, assets[0]);
  };

  root.updateWalletAsset = function() {
    var walletId = profileService.focusedClient.credentials.walletId,
        config = configService.getSync();
    config.assetFor = config.assetFor || {};
    root.walletAsset = config.assetFor[walletId] || configService.getDefaults().assets.defaultAsset;
    root.isAssetWallet = root.walletAsset !== 'bitcoin';
    updateAssetBalance();
    return root.walletAsset;
  };

  root.setWalletAsset = function(asset) {
    var walletId = profileService.focusedClient.credentials.walletId;

    var opts = {
      assetFor: {
      }
    };
    opts.assetFor[walletId] = asset.assetId;
    root.walletAsset = asset.assetId;
    updateAssetBalance();

    configService.set(opts, function(err) {
      if (err) $log.warn(err);
      $rootScope.$emit('Local/WalletAssetUpdated');
      go.walletHome();
    });
  };

  return root;
});