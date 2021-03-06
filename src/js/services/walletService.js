'use strict';

angular.module('copayApp.services').factory('walletService',
  function(profileService, coloredCoins, lodash, configService, $q, $log, $rootScope, go) {
  
  var root = {},
      self = this,
      selectedAssetId,
      btcAsset = {
        assetId: 'bitcoin',
        isAsset: false
      };

  root.btcBalance = null;
  
  root.walletAsset = {
    isAsset: false
  };
  
  $rootScope.$on('ColoredCoins/AssetsUpdated', function() {
    root.updateWalletAsset();
  });
  
  var getZeroAsset = function(assetId) {
    var unitSymbol = coloredCoins.getAssetSymbol(assetId, null);
    var balanceStr = coloredCoins.formatAssetAmount(0, null, unitSymbol);
    
    return {
      assetId: assetId,
      unitSymbol: unitSymbol,
      balanceStr: balanceStr,
      availableBalance: 0,
      availableBalanceStr: balanceStr,
      divisible: 0
    };
  };
  
  var getBtcAsset = function(assetId) {
    var unitSymbol = coloredCoins.getAssetSymbol(assetId, asset);
    var balanceStr = coloredCoins.formatAssetAmount(0, null, unit);
    
    return {
      assetId: assetId,
      isAsset: false
    };
  };

  var updateAssetBalance = function() {
    if (!self.selectedAssetId) { return {}; }

    var isAsset = self.selectedAssetId !== btcAsset.assetId,
        asset, unit, balanceStr;
    
    if (isAsset) {
      var asset = lodash.find(coloredCoins.assets, function(asset) {
         return asset.assetId == self.selectedAssetId;
       });
       
       if (!asset) {
          asset = getZeroAsset(self.selectedAssetId);
       }
       asset.isAsset = isAsset;
     } else {
       asset = btcAsset;
     }
     
     root.walletAsset = asset;
     $rootScope.$emit("Local/WalletAssetUpdated", root.walletAsset);
     return root.walletAsset;
  };

  root.setBtcBalance = function(btcBalance) {
    root.btcBalance = btcBalance;
  };

  root.updateWalletAsset = function() {
    if (!self.selectedAssetId) {
      var walletId = profileService.focusedClient.credentials.walletId,
          config = configService.getSync();
          
      config.assetFor = config.assetFor || {};
      self.selectedAssetId = config.assetFor[walletId] || configService.getDefaults().assets.defaultAsset;
    }
    
    return updateAssetBalance();
  };

  root.setSelectedAsset = function(asset) {
    var walletId = profileService.focusedClient.credentials.walletId;

    var opts = {
      assetFor: {
      }
    };
    opts.assetFor[walletId] = asset.assetId;
    self.selectedAssetId = asset.assetId;

    configService.set(opts, function(err) {
      if (err) $log.warn(err);
      updateAssetBalance();
      go.walletHome();
    });
  };

  return root;
});