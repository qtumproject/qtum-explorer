'use strict';

angular.module('insight.solidity_coder').factory('SolidityCoder',
    function($window) {
        return $window.eth_libs.solidity_coder;
    });

