angular.module('insight.transactions').controller('SendRawTransactionController',
	function ($scope, $http, $filter, SendRawTransaction, lodash) {

		var $cachedTextarea = null;

		var timeoutId = null;

		$scope.status = 'ready';  // ready|sent|error
		$scope.txid = '';
		$scope.error = null;
		$scope.isEmpty = false;
		$scope.rawTransaction;

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
				rawtx: $scope.rawTransaction.trim(),
			};

			SendRawTransaction.send(postData,
				function (successfullResponse) {

					if (typeof (successfullResponse.txid) != 'string') {
						// API returned 200 but the format is not known
						$scope.status = 'error';
						$scope.error = ': the transaction was sent but no transaction id was got back';

						return;
					}

					$scope.status = 'sent';
					$scope.txid = successfullResponse.txid;

					clearDataAfterSuccessfullSend();

				}, function (errorResponse) {

					var data = errorResponse.data;

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

			if (!$cachedTextarea) {
				$cachedTextarea = getElementByClassName('.sendrawtransaction-textarea');
			}

			$cachedTextarea.css('height', '215px');
			$cachedTextarea.css('padding', '0');

			$cachedTextarea.css('height', $cachedTextarea[0].scrollHeight + 'px');
		};

		$scope.$on('$destroy', function() {
			clearState();
		});

		var clearState = function () {
			$scope.status = 'ready';
			$scope.isEmpty = false;
			$scope.error = null;
			$scope.txid = '';

			clearTimeout(timeoutId);
		}

		var getElementByClassName = function(className) {
			return angular.element(className);
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

		

		var clearDataAfterSuccessfullSend = function() {

			$scope.rawTransaction = null;

			timeoutId = setTimeout(function() {
				clearState();
				$scope.$apply();
			}, 2 * 60 * 1000);

		}

	});