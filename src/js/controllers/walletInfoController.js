'use strict';

angular.module('copayApp.controllers').controller('walletInfoController',
    function ($scope, $rootScope, $timeout, profileService, configService, lodash, coloredCoins, assetsService) {
  function initAssets(assets) {
    assets = assets.reduce(function(map, asset) {
      map[asset.assetId] = map[asset.assetId] || { amount: 0, assetId: asset.assetId, asset: asset };
      map[asset.assetId].amount += asset.asset.amount;
      return map;
    }, {});

    this.assets = lodash.values(assets)
        .map(function(asset) {
          return {
            assetName: asset.asset.metadata.assetName,
            assetId: asset.assetId,
            balanceStr: coloredCoins.formatAssetAmount(asset.amount, asset.asset)
          };
        }).sort(function(a1, a2) {
          return a1.assetName > a2.assetName;
        });
  }

  var setAssets = initAssets.bind(this);

  setAssets(coloredCoins.assets || []);

  var disableAssetListener = $rootScope.$on('ColoredCoins/AssetsUpdated', function (event, assets) {
    setAssets(assets);
    $timeout(function() {
      $rootScope.$digest();
    });
  });

  $scope.$on('$destroy', function () {
    disableAssetListener();
  });

  this.walletAsset = assetsService.walletAsset();
});
