'use strict';

angular.module('insight.currency').controller('CurrencyController',
function($scope, $rootScope, Currency, Constants, BigNumber, $filter) {

	var self = this;
	
	$rootScope.currency = {
		symbol : Constants.DEFAULT_CURRENCY,
		factor : 1,
		bitstamp : 0
	};

	$rootScope.token = {};

	var _roundFloat = function(x, n) {

		if(!parseInt(n, 10) || !parseFloat(x)) n = 0;

		return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
	};

	$rootScope.currency.getConvertion = function(value) {
		
		value = Number(value);

		if (!isNaN(value) && typeof value !== 'undefined' && value !== null) {

			if (value === 0.00000000) return '0 ' + $rootScope.currency.symbol; // fix value to show

			var response;

			if ($rootScope.currency.symbol === Constants.CURRENCY.USD) {

				response = _roundFloat((value * $rootScope.currency.factor), 2);
			} 
			else if ($rootScope.currency.symbol === Constants.CURRENCY.mBTC) {

				$rootScope.currency.factor = 1000;
				response = _roundFloat((value * $rootScope.currency.factor), 5);
			} 
			else if ($rootScope.currency.symbol === Constants.CURRENCY.bits) {

				$rootScope.currency.factor = 1000000;
				response = _roundFloat((value * $rootScope.currency.factor), 2);
			} 
			else {
				$rootScope.currency.factor = 1;
				response = value;
			}
		// prevent sci notation
			if (response < 1e-7) {
				response = response.toFixed(8);
			}

			return $filter('numeraljs')(response, '0,0[.][00000000]') + ' ' + $rootScope.currency.symbol;
		}
		return 'value error';
	};

	$rootScope.token.convertDecimals = function (amount, decimals) {

		if (!amount) {
        	return 0;
		}

		var valueBN = new BigNumber(amount);

		return valueBN.dividedBy('1e' + (decimals ? decimals : 0)).toString(10);
	};

	self.setCurrency = function(currency) {

		$rootScope.currency.symbol = Constants.CURRENCY[ currency ];
		localStorage.setItem('insight-currency', Constants.CURRENCY[ currency ]);

		if (currency === 'USD') {

			Currency.get({}, function(res) {

				$rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp;
			});
		} 
		else if (currency === 'mBTC') {

			$rootScope.currency.factor = 1000;
		} 
		else if (currency === 'bits') {

			$rootScope.currency.factor = 1000000;
		} 
		else {
			$rootScope.currency.factor = 1;
		}
	};

	// Get initial value
	Currency.get({}, function(res) {
		
		$rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp;
	});
});
