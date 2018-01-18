'use strict';

angular.module('insight.search').controller('SearchController',
  function($location, $timeout, Block, Transaction, Address, BlockByHeight, ERC20ContractInfo, Contracts) {
	
	var self = this;
	self.loading = false;

	var _badQuery = function() {
		self.badQuery = true;

		$timeout(function() {
			self.badQuery = false;
		}, 2000);
	};

	var _resetSearch = function() {
		self.q = '';
		self.loading = false;
	};

	self.search = function() {

		var q = self.q.trim();

		self.badQuery = false;
		self.loading = true;

		Block.get({
			blockHash: q
		}, function() {

			_resetSearch();
			$location.path('block/' + q);
		}, function() { //block not found, search on TX

			Transaction.get({
				txId: q
			}, function() {

				_resetSearch();
				$location.path('tx/' + q);
			}, function() { //tx not found, search on Address

				var bitAddress = q;

				Address.get({
					addrStr: bitAddress
				}, function() {

					_resetSearch();
					$location.path('address/' + bitAddress);
				}, function() { // block by height not found

					if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
						BlockByHeight.get({
							blockHeight: q
						}, function(hash) {

							_resetSearch();
							$location.path('/block/' + hash.blockHash);
						}, function() { //not found, fail :(

							self.loading = false;
							_badQuery();
						});
					}
					else {

                        ERC20ContractInfo.get({
                            contractAddress: q
                        }, function() {

                            _resetSearch();
                            $location.path('/token/' + q);
                        }, function () {
                            self.loading = false;
                            _badQuery();
						});


					}
				});
			});
		});
	};

});
