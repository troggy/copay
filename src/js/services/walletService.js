'use strict';

angular.module('copayApp.services').factory('walletService',
  function(profileService, coloredCoins, lodash, configService, $q, $log, $rootScope, go) {
  
  var root = {},
      self = this,
      selectedAssetId;

  root.btcBalance = null;
  root.walletAsset = {
    isAsset: false
  };
  
  $rootScope.$on('ColoredCoins/AssetsUpdated', function() {
    root.updateWalletAsset();
  });

  var updateAssetBalance = function() {
    if (!self.selectedAssetId) { return {}; }
    var isAsset = self.selectedAssetId !== 'bitcoin',
        asset, unit;
    
    if (isAsset) {
      var assets = lodash.filter(coloredCoins.assets, function(asset) {
         return asset.assetId == self.selectedAssetId;
       });
       
       if (assets.length == 0) { return {}; }
       
       asset = assets[0];
       unit = coloredCoins.getAssetSymbol(self.selectedAssetId, asset);
     }
     
     root.walletAsset = { 
       assetId: self.selectedAssetId,
       isAsset: isAsset,
       balanceStr: isAsset ? asset.balanceStr : root.btcBalance,
       unit: unit,
       asset: asset
     };
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