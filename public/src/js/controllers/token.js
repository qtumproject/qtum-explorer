'use strict';

angular.module('insight.token').controller('TokenController',
function($scope, $rootScope, $routeParams, $location, ERC20ContractInfo, ERC20Transfers) {

	var self = this;

	self.tokenInfo;
	self.transfers;
	self.contractAddress = $routeParams.address;
	self.tab = 'transfers';

	self.loadTokenInfo = function() {

		ERC20ContractInfo.get({
			address: $routeParams.address
		}).$promise.then(function (info) {

			self.tokenInfo = info;
		});

		loadTabContent();
	}

	var loadTabContent = function() {
		switch(self.tab){
			case 'transfers': {
				_getTransfers(0);
			}
			case 'holders': {
				_getHolders();
			}
			case 'read': {
				_getSmartContract();
			}
		}
	}

	var _getTransfers = function(offset) {

		ERC20Transfers.get({
			address: $routeParams.address,
			offset: offset
		}).$promise.then(function (trList) {

			self.transfers = trList;
			self.transfers.pages = Math.floor(self.transfers.count / self.transfers.limit);
			console.log(trList)
		});
	}

	var _getHolders = function() {
	}

	var _getSmartContract = function() {
	}

	self.paginateTransfers = function(offset) {

		_getTransfers(offset);
	}

	self.setTab = function(tabname) {
		self.tab = tabname;
		loadTabContent();
	}
});


