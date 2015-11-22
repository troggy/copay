'use strict';

angular.module('copayApp.services').factory('assetsService', function(profileService, configService, $log) {
  var root = {};

  root.walletAsset = function() {
    var walletAsset;
    try {
      walletAsset = profileService.focusedClient.credentials.customData.walletAsset
    } catch (e) {
    }

    walletAsset = walletAsset || configService.getDefaults().assets.defaultAsset;
    return walletAsset;
  };

  return root;
});