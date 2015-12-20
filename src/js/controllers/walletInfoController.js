'use strict';

angular.module('copayApp.controllers').controller('walletInfoController',
    function ($scope, $rootScope, $timeout, profileService, configService, lodash, coloredCoins, walletService) {
  
  var self = this;

  function initAssets(assets) {
    
    if (!assets) {
      this.assets = [];
      return;
    }

    this.assets = lodash.values(assets)
        .map(function(asset) {
          return {
            assetName: asset.metadata.assetName,
            assetId: asset.assetId,
            balanceStr: asset.balanceStr
          };
        })
        .concat([{
          assetName: 'Bitcoin',
          assetId: 'bitcoin',
          balanceStr: walletService.btcBalance
        }])
        .sort(function(a1, a2) {
          return a1.assetName > a2.assetName;
        });
  }

  var setAssets = initAssets.bind(this);

  coloredCoins.getAssets().then(function(assets) {
    self.assetId = walletService.walletAsset.assetId;
    setAssets(assets);
  });

  var disableAssetListener = $rootScope.$on('Local/WalletAssetUpdated', function (event, walletAsset) {
    setAssets(coloredCoins.assets);
    self.assetId = walletService.walletAsset.assetId;
    $timeout(function() {
      $rootScope.$digest();
    });
  });

  $scope.$on('$destroy', function () {
    disableAssetListener();
  });

  this.setSelectedAsset = function(asset) {
    walletService.setSelectedAsset(asset);
  };
});
