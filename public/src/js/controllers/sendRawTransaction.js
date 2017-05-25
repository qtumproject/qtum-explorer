angular.module('insight.transactions').controller('SendRawTransactionController', 
	function($scope, $http) {
		
		$scope.transaction = '';
		$scope.status = 'ready';  // ready|loading|sent|error
		$scope.txid = '';
		$scope.error = null;

		$scope.formValid = function() {
			
			return !!$scope.transaction;
		};
		$scope.send = function() {

			var postData = {
				rawtx: $scope.transaction
			};
			$scope.status = 'loading';

			$http.post(window.apiPrefix + '/tx/send', postData)
			.success(function(data, status, headers, config) {
				if(typeof(data.txid) != 'string') {
				// API returned 200 but the format is not known
					$scope.status = 'error';
					$scope.error = 'The transaction was sent but no transaction id was got back';

					return;
				}

				$scope.status = 'sent';
				$scope.txid = data.txid;
			})
			.error(function(data, status, headers, config) {

					$scope.status = 'error';

				if(data) {

					$scope.error = data;
				} else {
					$scope.error = "No error message given (connection error?)"
				}
			});
		};
	});