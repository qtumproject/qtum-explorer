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
	.factory('Statistics24Hours', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/total');
	})
	.factory('MarketPrice', function($resource, $window) {
		
		return $resource('https://min-api.cryptocompare.com/data/price?fsym=QTUM&tsyms=USD');
	});
