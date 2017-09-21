'use strict';

angular.module('insight.web3_utils').factory('Web3Utils',
    function($window) {
        return $window.eth_libs.utils;
    });

