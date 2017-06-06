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
	.factory('StatisticsByDays', function($resource, $window) {

		return $resource($window.apiPrefix + '/statistics/transactions', {
			days: '@days'
		});
	});
