'use strict';

angular.module('copayApp.controllers').controller('walletInfoController',
    function ($scope, $rootScope, $timeout, profileService, configService, lodash, coloredCoins, walletService) {
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
            balanceStr: coloredCoins.formatAssetAmount(asset.amount, asset)
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

  if (!coloredCoins.onGoingProcess) {
    setAssets(coloredCoins.assets);
  } else {
    this.assets = null;
  }

  var disableAssetListener = $rootScope.$on('ColoredCoins/AssetsUpdated', function (event, assets) {
    setAssets(assets);
    $timeout(function() {
      $rootScope.$digest();
    });
  });

  $scope.$on('$destroy', function () {
    disableAssetListener();
  });

  this.walletAsset = walletService.updateWalletAsset();

  this.setWalletAsset = function(asset) {
    walletService.setWalletAsset(asset);
  };
});
