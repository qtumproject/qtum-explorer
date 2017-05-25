'use strict';

angular.module('insight.transactions').controller('TransactionsController',
function($scope, $rootScope, $routeParams, $location, Transaction, TransactionsByBlock, TransactionsByAddress, Bitcorelib, Contracts) {

	var self = this;
	var pageNum = 0;
	var pagesTotal = 1;
	var COIN = 100000000;
	self.loading = false;
	self.loadedBy = null;
	self.isCopied = false;
	self.scrollConfig = {
		autoHideScrollbar: false,
		theme: 'custom',
		advanced:{
			updateOnContentResize: true
		},
		setHeight: 230,
		scrollInertia: 0
	};

	var _aggregateItems = function(txId, items) {

		if (!items) return [];

		var l = items.length;
		var ret = [];
		var tmp = {};
		var u = 0;

		for(var i=0; i < l; i++) {

			var notAddr = false;
			// non standard input
			if (items[i].scriptSig && !items[i].addr) {

				items[i].addr = 'Unparsed address [' + u++ + ']';
				items[i].notAddr = true;
				notAddr = true;
			}
			// non standard output
			if (items[i].scriptPubKey && !items[i].scriptPubKey.addresses) {

				var contractAddress;

				if (items[i].scriptPubKey.hex) {

					contractAddress = Contracts.getContractAddressByHex(txId, items[i]['n'], items[i].scriptPubKey.hex);
				}

				if (contractAddress) {

					items[i].contractAddress = contractAddress;
				}

				items[i].scriptPubKey.addresses = ['Unparsed address [' + u++ + ']'];
				items[i].notAddr = true;
				notAddr = true;
			}
			// multiple addr at output
			if (items[i].scriptPubKey && items[i].scriptPubKey.addresses.length > 1) {

				items[i].addr = items[i].scriptPubKey.addresses.join(',');
				ret.push(items[i]);

				continue;
			}

			var addr = items[i].addr || (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);

			if (!tmp[addr]) {

				tmp[addr] = {};
				tmp[addr].valueSat = 0;
				tmp[addr].count = 0;
				tmp[addr].addr = addr;
				tmp[addr].items = [];
			}

			tmp[addr].isSpent = items[i].spentTxId;
			tmp[addr].doubleSpentTxID = tmp[addr].doubleSpentTxID   || items[i].doubleSpentTxID;
			tmp[addr].doubleSpentIndex = tmp[addr].doubleSpentIndex || items[i].doubleSpentIndex;
			tmp[addr].dbError = tmp[addr].dbError || items[i].dbError;
			tmp[addr].valueSat += Math.round(items[i].value * COIN);
			tmp[addr].items.push(items[i]);
			tmp[addr].notAddr = notAddr;
			tmp[addr].contractAddress = items[i].contractAddress || null;

			if (items[i].unconfirmedInput){

				tmp[addr].unconfirmedInput = true;
			}

			tmp[addr].count++;
		}

		angular.forEach(tmp, function(v) {

			v.value    = v.value || parseInt(v.valueSat) / COIN;
			ret.push(v);
		});

		return ret;
	};

	var _getContractBytecode = function (tx) {

		var items = tx.vout;
		var l = items.length;

		for(var i=0; i < l; i++) {

			if (items[i].scriptPubKey && items[i].scriptPubKey.hex) {

				var bytecode = Contracts.getContractBytecode(items[i].scriptPubKey.hex);

				if (bytecode) {
					return bytecode;
				}
			}
		}

		return null;
	};

	var _processTX = function(tx) {

		tx.vinSimple = _aggregateItems(tx.txid, tx.vin);
		tx.voutSimple = _aggregateItems(tx.txid, tx.vout);
		tx.contractBytecode = _getContractBytecode(tx);

		if (tx.contractBytecode) {

			tx.contractAsm = Contracts.getContractOpcodesString(tx.contractBytecode);
		}
	};

	var _paginate = function(data) {

		self.loading = false;
		pagesTotal = data.pagesTotal;
		pageNum += 1;

		data.txs.forEach(function(tx) {

			tx.showAdditInfo = false;
			_processTX(tx);
			self.txs.push(tx);
		});
	};

	var _byBlock = function() {

		TransactionsByBlock.get({
			block: $routeParams.blockHash,
			pageNum: pageNum
		}, function(data) {

			_paginate(data);
		});
	};

	var _byAddress = function () {

		TransactionsByAddress.get({
			address: $routeParams.addrStr,
			pageNum: pageNum
		}, function(data) {

			_paginate(data);
		});
	};

	var _byContractAddress = function () {

		TransactionsByAddress.get({
			address: Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr),
			pageNum: pageNum
		}, function(data) {

			_paginate(data);
		});
	};

	var _findTx = function(txid) {

		Transaction.get({
			txId: txid
		}, function(tx) {

			$rootScope.titleDetail = tx.txid.substring(0,7) + '...';
			$rootScope.flashMessage = null;
			self.tx = tx;

			_processTX(tx);

			self.txs.unshift(tx);

		}, function(e) {

			if (e.status === 400) {

				$rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
			}
			else if (e.status === 503) {

				$rootScope.flashMessage = 'Backend Error. ' + e.data;
			}
			else {
				$rootScope.flashMessage = 'Transaction Not Found';
			}

			$location.path('/');
		});
	};

	self.findThis = function() {
		
		_findTx($routeParams.txId);
	};

	//Initial load
	self.load = function(from) {
		
		self.loadedBy = from;
		self.loadMore();
	};

	//Load more transactions for pagination
	self.loadMore = function() {

		if (pageNum < pagesTotal && !self.loading) {
		
			self.loading = true;

			switch(self.loadedBy) {
				case 'address':
					_byAddress();
					break;
				case 'contractAddress':
					_byContractAddress();
					break;
				default:
					_byBlock();
			}
		}
	};

	// Highlighted txout
	if ($routeParams.v_type == '>' || $routeParams.v_type == '<') {

		self.from_vin = $routeParams.v_type == '<' ? true : false;
		self.from_vout = $routeParams.v_type == '>' ? true : false;
		self.v_index = parseInt($routeParams.v_index);
		self.itemsExpanded = true;
	}

	//Init without txs
	self.txs = [];

	$scope.$on('tx', function(event, txid) {
		_findTx(txid);
	});
});


