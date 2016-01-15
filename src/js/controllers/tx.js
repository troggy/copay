'use strict';

angular.module('copayApp.controllers').controller('txController',
  function($rootScope, $scope, $timeout, $filter, lodash, profileService, isCordova, nodeWebkit, configService, animationService, gettextCatalog, bitrefill) {

    var fc = profileService.focusedClient;
    var config = configService.getSync();
    var configWallet = config.wallet;
    var walletSettings = configWallet.settings;
    var m = angular.element(document.getElementsByClassName('txModal'));
    m.addClass(animationService.modalAnimated.slideRight);

    this.alternativeIsoCode = walletSettings.alternativeIsoCode;
    this.color = fc.backgroundColor;
    this.copayerId = fc.credentials.copayerId;
    this.isShared = fc.credentials.n > 1;

    $rootScope.$watch('index.showTx', function(newTx, oldTx) {
      if (newTx !== oldTx && newTx.customData && newTx.customData.bitrefillOrderId) {
        $scope.orderId = newTx.customData.bitrefillOrderId;
        $scope.deliveryStatus = "N/A";
        bitrefill.orderStatus(newTx.customData.bitrefillOrderId, function(err, status) {
          if (err) {
            return;
          }
          if (status.delivered) {
            $scope.deliveryStatus = "delivered";
          } else if (!status.paymentRecieved && !status.failed) {
            $scope.deliveryStatus = "awaiting payment";
          } else if (status.failed) {
            $scope.deliveryStatus = "failed";
          } else {
            $scope.deliveryStatus = "in progress";
          }
        });
      }
    });

    if (isCordova) {
      $rootScope.modalOpened = true;
      var self = this;
      var disableCloseModal = $rootScope.$on('closeModal', function() {
        self.cancel();
      });
    }

    this.getAlternativeAmount = function(btx) {
      var self = this;
      var satToBtc = 1 / 100000000;
      fc.getFiatRate({
        code: self.alternativeIsoCode,
        ts: btx.time * 1000
      }, function(err, res) {
        if (err) {
          $log.debug('Could not get historic rate');
          return;
        }
        if (res && res.rate) {
          var alternativeAmountBtc = (btx.amount * satToBtc).toFixed(8);
          $scope.rateDate = res.fetchedOn;
          $scope.rateStr = res.rate + ' ' + self.alternativeIsoCode;
          $scope.alternativeAmountStr = $filter('noFractionNumber')(alternativeAmountBtc * res.rate, 2) + ' ' + self.alternativeIsoCode;
          $scope.$apply();
        }
      });
    };

    this.getShortNetworkName = function() {
      var n = fc.credentials.network;
      return n.substring(0, 4);
    };

    this.copyToClipboard = function(value) {
      if (isCordova) {
        window.cordova.plugins.clipboard.copy(value);
        window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
      } else if (nodeWebkit.isDefined()) {
        nodeWebkit.writeToClipboard(value);
      }
    };

    this.cancel = lodash.debounce(function() {
      m.addClass(animationService.modalAnimated.slideOutRight);
      if (isCordova) {
        $rootScope.modalOpened = false;
        disableCloseModal();
        $timeout(function() {
          $rootScope.$emit('Local/TxModal', null);
        }, 350);
      } else {
        $rootScope.$emit('Local/TxModal', null);
      }
    }, 0, 1000);

  });
