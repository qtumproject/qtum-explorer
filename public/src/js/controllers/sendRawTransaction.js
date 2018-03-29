angular.module('insight.transactions').controller('SendRawTransactionController',
	function($scope, $http, $filter, lodash) {

		$scope.status = 'ready';  // ready|loading|sent|error
		$scope.txid = '';
		$scope.error = null;
		$scope.isEmpty = false;

		$scope.send = function() {

			clearState();

			var rawTrx = getTrxHex();

			if (!validateRawTransaction(rawTrx)) {
				console.log('bad trx');
				return;
			}

			var postData = {
				rawtx: rawTrx
			};

			$scope.status = 'loading';

			$http.post(window.apiPrefix + '/tx/send', postData)
				.success(function (data, status, headers, config) {
					if (typeof (data.txid) != 'string') {
						// API returned 200 but the format is not known
						$scope.status = 'error';
						$scope.error = ': the transaction was sent but no transaction id was got back';

						return;
					}

					$scope.status = 'sent';
					console.log('[ON SUCCESS]', JSON.stringify(data, null, 2));
					// $scope.txid = data.txid;
				})
				.error(function (data, status, headers, config) {

					$scope.status = 'error';

					if (data) {
						$scope.error = ': ' + data;
						console.log('[ON ERROR]', JSON.stringify(data, null, 2));
					} else {
						$scope.error = "no error message given (connection error?)"
					}

				});
		};


		$scope.isStatusError = function() {
			return $scope.status === 'error' ? true : false;
		}

		$scope.checkIsEmpty = function() {
			return $scope.isEmpty;
		}

		$scope.stripFormat = function ($html) {
			console.log('qwert');
			console.log($html);
			return  $html ? String($html).replace(/<[^>]+>/gm, '') : '';
		};

		var clearState = function() {
			$scope.status = 'ready';
			$scope.isEmpty = false;
			$scope.error = null;
		}

		var getTrxHex = function() {
			var rawTrx = angular.element('#sendrawtransaction-data-div').text();

			rawTrx = rawTrx.trim();

			return rawTrx;
		}

		var validateRawTransaction = function(rawTrx) {
			
			if (!rawTrx) {
				$scope.isEmpty = true;
				return false;
			}

			if (!lodash.isString(rawTrx) || !(/^[0-9a-fA-F]+$/.test(rawTrx))) {
				console.log('lodash is stirng', lodash.isString(rawTrx));
				$scope.status = 'error';
				$scope.error = ': the transaction hex is not valid';
				return false;
			}

			return true;
		}

	});