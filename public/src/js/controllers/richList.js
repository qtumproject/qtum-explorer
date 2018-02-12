'use strict';


angular.module('insight.richList').controller('RichListController', function($scope, $routeParams, StatisticsRichestList) {

    var self = this;

    self.items = [];
    self.loaded = false;

    self.init = function() {
        StatisticsRichestList.query({}, function (items) {
            self.items = items;
            self.loaded = true;
        });
    };

});