'use strict';

angular.module('insight.token').controller('TokenController',
function($routeParams, ERC20ContractInfo, ERC20Transfers) {

	var self = this;

	self.tokenInfo;
	self.transfers;
	self.contractAddress = $routeParams.address;
	self.tab = 'transfers';

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
			self.transfers.pages = Math.ceil(self.transfers.count / self.transfers.limit);
		});
	}

	var _getHolders = function() {
	}

	var _getSmartContract = function() {
	}

	self.loadTokenInfo = function() {
		
		ERC20ContractInfo.get({
			address: $routeParams.address
		}).$promise.then(function (info) {

			self.tokenInfo = info;
		});

		loadTabContent();
	}

	self.paginateTransfers = function(offset) {

		if(self.transfers.limit && self.transfers.pages > offset / self.transfers.limit && offset >= 0) {
			_getTransfers(offset);
		}
	}

	self.setTab = function(tabname) {

		if(self.tab === tabname){
			return;
		}

		self.tab = tabname;
		loadTabContent();
	}
});


