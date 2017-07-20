'use strict';

angular.module('insight.contracts').controller('ContractsController',
function($scope, $rootScope, $routeParams, $location, $q, Address, StorageByAddress, getSocket, ContractsInfo, Transaction, Contracts, Constants, gettextCatalog) {

	var self = this;
	var addrStr;
	var socket = getSocket($scope);
	var hexString = '0000000000000000000000000000000000000000000000000000000000000000';
	self.STORAGE_ROWS = Constants.STORAGE_ROWS;
	self.STORAGE_CONST = {
		STRING: 'string',
		NUMBER: 'number',
		ADDRESS: 'address',
		DATA: 'data',
	};
	self.storageViews = [ self.STORAGE_CONST.DATA, self.STORAGE_CONST.STRING, self.STORAGE_CONST.NUMBER, self.STORAGE_CONST.ADDRESS ];
	self.storage = {};
	self.params = $routeParams;
	self.tooltipOptions = {
		animation: 'fade',
		theme: 'tooltipster-black',
		trigger: 'click',
		interactive: true
	};
	self.scrollConfig = {
		autoHideScrollbar: false,
		theme: 'custom',
		advanced:{
			updateOnContentResize: true
		},
		scrollInertia: 0
	};
	self.qrColors = {
		background: Constants.QRCOLOR.background,
		color: Constants.QRCOLOR.color
	};

	try {
		addrStr = Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr);
	}
	catch (e) {

		$rootScope.flashMessage = 'Invalid Address: ' + $routeParams.contractAddressStr;
		$location.path('/');

		return false;
	}

	var _parseStorageRowType = function(hex, type) {

		switch (type){

			case 'string': {

				var newValue = '';
				var i = hex.substring(0, 2) === '0x' ? 2 : 0; 

				for ( ; i < hex.length; i += 2) {

					var symbol = String.fromCharCode(parseInt(hex.substr(i, 2), 16));

					symbol = !symbol.charCodeAt() ? ' ' : symbol;
					newValue += symbol;
				}
				
				return newValue;
			}
			case 'number': {
				return parseInt(hex, 16);
			}
			case 'address': {
				return hex.substr(-40);
			}
			case 'data': {
				return hexString.substr(hex.length).concat(hex);
			}
			default: {
				return hex;
			}
		}
	};

	var _defineDefaultState = function(string, number){

		var stringMatchUnread = string.match(/[^a-zA-Z0-9;:'".,\/\]\[?!&%#@)(_`><\s]/g) || [];
		var stringMatchRead = string.match(/[a-zA-Z0-9;:'".,\/\]\[?!&%#@)(_`><]/g);
		var isLastSymbolUnread = string[ string.length - 1 ] === stringMatchUnread[0];

		if(!~(number.toString().indexOf('e'))){
			return self.STORAGE_CONST.NUMBER;
		}

		if((isLastSymbolUnread || !stringMatchUnread.length) && stringMatchRead){
			return self.STORAGE_CONST.STRING;
		}

		return self.STORAGE_CONST.DATA;
	};

	var _formStorageInfo = function() {

		var rows = [];

		for(var row in self.info.storage){
			if(self.info.storage.hasOwnProperty(row)){
				for(var key in self.info.storage[ row ]){
					
					var newRow = {
						values: {},
						keys: {}
					};

					if(self.info.storage[ row ].hasOwnProperty(key)){
						for(var CONST in self.STORAGE_CONST){

							var constName = self.STORAGE_CONST[ CONST ];

							newRow.values[ constName ] = _parseStorageRowType(self.info.storage[ row ][ key ], constName);
							newRow.keys[ constName ] = _parseStorageRowType(key, constName);
						}

						newRow.values.state = _defineDefaultState(newRow.values.string, newRow.values.number, newRow.values.address);
						newRow.keys.state = _defineDefaultState(newRow.keys.string, newRow.keys.number, newRow.keys.address);
						
						rows.push(newRow);
					}
				}
			}
		}
		return rows;
	};

	var _startSocket = function() {

		socket.on('bitcoind/addresstxid', function(data) {

			if (data.address === addrStr) {

				$rootScope.$broadcast('tx', data.txid);
				var base = document.querySelector('base');
				var beep = new Audio(base.href + '/sound/transaction.mp3');
				beep.play();
			}
		});

		socket.emit('subscribe', 'bitcoind/addresstxid', [addrStr]);
	};

	var _stopSocket = function() {

		socket.emit('unsubscribe', 'bitcoind/addresstxid', [addrStr]);
	};

	socket.on('connect', function() {

		_startSocket();
	});

	$scope.$on('$destroy', function(){

		_stopSocket();
	});

	self.findOne = function() {

		$rootScope.contractAddressStr = $routeParams.contractAddressStr;

		$q.all([ ContractsInfo.get({
			contractAddressStr: $routeParams.contractAddressStr
		}).$promise, Address.get({
			addrStr: addrStr
		}).$promise])
		.then(function(values) {

			var info = values[0];
			var address = values[1];

			$rootScope.flashMessage = null;
			$rootScope.titleDetail = $routeParams.contractAddressStr.substring(0, 7) + '...';

			self.info = info;
			self.opcodesStr = Contracts.getContractOpcodesString(info.code);
			self.bitAddress = addrStr;
			self.address = address;
			self.storage.rows = _formStorageInfo();
			self.storage.storageLength = Object.keys(info.storage).length;
			self.storage.viewRows = Constants.STORAGE_ROWS;
		})
		.catch(function (e) {

			if (e.status === 400) {

				$rootScope.flashMessage = 'Invalid Address: ' + $routeParams.addrStr;
			} else if (e.status === 503) {

				$rootScope.flashMessage = 'Backend Error. ' + e.data;
			} else {
				$rootScope.flashMessage = 'Address Not Found';
			}

			$location.path('/');
		});
	};

	self.toggleStorageRowView = function(index, stateType) {

		var currentStateNumber = self.storageViews.indexOf(self.storage.rows[ index ][ stateType ].state);

		self.storage.rows[ index ][ stateType ].state = self.storageViews[ (currentStateNumber + 1) % self.storageViews.length ];
	};

	self.showMoreStorageRows = function(limit){

		self.storage.viewRows = limit;
	};
});