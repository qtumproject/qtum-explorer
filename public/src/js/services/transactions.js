'use strict';

angular.module('insight.transactions')
	.factory('Transaction',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/tx/:txId', {
			txId: '@txId'
		}, {
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
	.factory('TransactionsByBlock',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/txs', {
			block: '@block'
		});
	})
	.factory('TransactionsByAddress',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/txs', {
			address: '@address'
		});
	})
	.factory('Transactions',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/txs');
	})
	.factory('TransactionsByDays',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/statistics/transactions', {
			days: '@days'
		});
	})
	.factory('SendRawTransaction',
	function($resource, $window) {
		return $resource($window.apiPrefix + '/tx/send', {},
			{
				send: {
					method: 'POST',
					interceptor: {
						response: function (res) {
							return res.data;
						},
						responseError: function (res) {
							return res.data;
						}
					}
				}
			});
	});
