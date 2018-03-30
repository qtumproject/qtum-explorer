angular.module('insight.transactions').controller('SendRawTransactionController',
	function ($scope, $http, $filter, lodash) {

		$scope.status = 'ready';  // ready|sent|error
		$scope.txid = '';
		$scope.error = null;
		$scope.isEmpty = false;
		$scope.rawTransaction;
		$scope.txid = '';

		$scope.scrollConfig = {
			autoHideScrollbar: false,
			theme: 'custom',
			mouseWheel: {
				preventDefault: true,
				// ["select","option","keygen","datalist","textarea"]
				// if u want to enable over scrolling
				// just replace the array item on needed position with null (actually any replacement works)
				disableOver: ['select', 'option', 'keygen', 'datalist', null]
			},
			advanced: {
				updateOnContentResize: true,
				autoScrollOnFocus: false,
			},
			scrollInertia: 0
		};

		$scope.send = function () {

			clearState();

			if (!validateRawTransaction()) {
				return;
			}

			var postData = {
				rawtx: $scope.rawTransaction,
			};

			$http.post(window.apiPrefix + '/tx/send', postData)
				.success(function (data, status, headers, config) {
					if (typeof (data.txid) != 'string') {
						// API returned 200 but the format is not known
						$scope.status = 'error';
						$scope.error = ': the transaction was sent but no transaction id was got back';

						return;
					}

					$scope.status = 'sent';
					$scope.txid = data.txid;
				})
				.error(function (data, status, headers, config) {

					$scope.status = 'error';

					if (data) {
						$scope.error = ': ' + data;
					} else {
						$scope.error = "no error message given (connection error?)"
					}

				});
		};


		$scope.isStatusError = function () {
			return $scope.status === 'error' ? true : false;
		}

		$scope.checkIsEmpty = function () {
			return $scope.isEmpty;
		}

		$scope.isStatusSent = function () {
			return $scope.status === 'sent' ? true : false;
		}

		$scope.autosize = function () {
			var el = angular.element('.sendrawtransaction-textarea');

			el[0].style.cssText = 'height: 215px; padding: 0';
			el[0].style.cssText = 'height:' + el[0].scrollHeight + 'px';
		};

		var clearState = function () {
			$scope.status = 'ready';
			$scope.isEmpty = false;
			$scope.error = null;
		}

		var getTrxHex = function () {
			var rawTrx = angular.element('#sendrawtransaction-data-div').text();

			rawTrx = rawTrx.trim();

			return rawTrx;
		}

		var validateRawTransaction = function () {

			var rawTrx = $scope.rawTransaction;

			if (!rawTrx) {
				$scope.isEmpty = true;

				return false;
			}

			if (!lodash.isString(rawTrx) || !(/^[0-9a-fA-F]+$/.test(rawTrx))) {
				$scope.status = 'error';
				$scope.error = ': the transaction hex is not valid';

				return false;
			}

			return true;
		}

	});