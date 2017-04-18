'use strict';

angular.module('insight.bitcorelib').factory('Bitcorelib',
    function() {
        var Bitcorelib = require('bitcore-lib');
        return Bitcorelib;
    });

