'use strict';

angular.module('insight.qtumcorelib').factory('QtumCoreLib',
    function() {
        var QtumCoreLib = require('qtumcore-lib');
        return QtumCoreLib;
    });

