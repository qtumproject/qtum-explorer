'use strict';

angular.module('insight.markets')
    .factory('MarketsInfo',
        function($resource) {
            return $resource(window.apiPrefix + '/markets/info', {
                q: '@q'
            });
        });