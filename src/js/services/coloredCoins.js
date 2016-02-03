'use strict';
angular.module('copayApp.services')
  .factory('coloredCoins', function($log) {
    var root = {
      whenAvailable: function() {}
    };
    $log.warn('COLORED COINS INIT !!!!!!!!');
    return root;
  });