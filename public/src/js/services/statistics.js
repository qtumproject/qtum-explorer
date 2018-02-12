'use strict';

angular.module('insight.statistics')
	.factory('Statistics',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/stats', {
			get: {
				method: 'GET',
				interceptor: {
					response: function (res) {

						return res.data;
					},
					responseError: function (res) {
						if (res.status === 404) {

							return res;
						}
					}
				}
			}
		});
	})
	.factory('StatisticsByDaysTransactions', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/transactions', {
			days: '@days'
		});
	})
	.factory('StatisticsByDaysFees', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/fees', {
			days: '@days'
		});
	})
	.factory('StatisticsByDaysOutputs', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/outputs', {
			days: '@days'
		});
	})
	.factory('StatisticsByDaysDifficulty', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/difficulty', {
			days: '@days'
		});
	})
	.factory('StatisticsByDaysStakes', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/stake', {
			days: '@days'
		});
	})
    .factory('StatisticsByDaysSupply', function($resource, $window) {

        return $resource($window.apiPrefix + '/statistics/supply', {
            days: '@days'
        });
    })
	.factory('Statistics24Hours', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/total');
	})
    .factory('StatisticsTotalSupply', function($resource, $window) {
        return $resource($window.apiPrefix + '/statistics/total-supply', {
            format: '@format'
        });
    })
	.factory('StatisticsBalanceIntervals', function($resource, $window) {
    	return $resource($window.apiPrefix + '/statistics/balance-intervals');
	}).factory('StatisticsRicherThan', function($resource, $window) {
    	return $resource($window.apiPrefix + '/statistics/richer-than');
	}).factory('StatisticsRichestList', function($resource, $window) {
    	return $resource($window.apiPrefix + '/statistics/richest-addresses-list');
	});
