'use strict';

angular.module('insight.bignumber').factory('BigNumber',
    function($window) {
        return $window.eth_libs.BigNumber;
    });

