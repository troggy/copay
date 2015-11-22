'use strict';

angular.module('copayApp.services').factory('assetsService', function(profileService, configService, $log, $rootScope, go) {
  var root = {};

  root.walletAsset = function() {
    var walletId = profileService.focusedClient.credentials.walletId,
        config = configService.getSync();
    config.assetFor = config.assetFor || {};
    return config.assetFor[walletId] || configService.getDefaults().assets.defaultAsset;
  };

  root.setWalletAsset = function(asset) {
    var walletId = profileService.focusedClient.credentials.walletId;

    var opts = {
      assetFor: {
      }
    };
    opts.assetFor[walletId] = asset.assetId;

    configService.set(opts, function(err) {
      if (err) $log.warn(err);
      $rootScope.$emit('Local/WalletAssetUpdated');
      go.walletHome();
    });
  };

  return root;
});