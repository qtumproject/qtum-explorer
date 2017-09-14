'use strict';

angular.module('insight.token').controller('TokenController',
function($routeParams, ERC20ContractInfo, ERC20Transfers, ERC20Holders) {

	var self = this;

	self.tokenInfo = {};
	self.transfers = {};
	self.holders = {};
	self.contractAddress = $routeParams.address;
	self.tab = 'transfers';

	var _loadTabContent = function(offset) {
		switch(self.tab){
			case 'transfers': {
				_getTransfers(offset ? offset : 0);
				break;
			}
			case 'holders': {
				_getHolders(offset ? offset : 0);
				break;
			}
			case 'read': {
				_getSmartContract(offset ? offset : 0);
				break;
			}
		}
	};

	var _getTransfers = function(offset) {

		ERC20Transfers.get({
			address: $routeParams.address,
			offset: offset
		}).$promise.then(function (trList) {

			self.transfers = trList;
			self.transfers.pages = Math.ceil(self.transfers.count / self.transfers.limit);
		});
	};

	var _getHolders = function(offset) {
		
		ERC20Holders.get({
			address: $routeParams.address,
			offset: offset
		}).$promise.then(function (holderList) {

			self.holders = holderList;
			self.holders.pages = Math.ceil(self.holders.count / self.holders.limit);
		});
	};

	var _loadTokenInfo = function() {
		
		ERC20ContractInfo.get({
			address: $routeParams.address
		}).$promise.then(function (info) {

			self.tokenInfo = info;
		});
	};

	var _getSmartContract = function(offset) {
	};

	self.init = function() {

		_loadTokenInfo();
		_loadTabContent();
	};

	self.paginate = function(offset) {

		if (self[self.tab].limit && self[self.tab].pages > offset / self[self.tab].limit && offset >= 0 && self[self.tab].offset !== offset) {
			_loadTabContent(offset);
		}
	};

	self.setTab = function(tabName) {

		if (self.tab === tabName) {
			return;
		}

		self.tab = tabName;
		_loadTabContent();
	};
});


