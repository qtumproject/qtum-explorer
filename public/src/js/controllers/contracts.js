'use strict';

angular.module('insight.contracts').controller('ContractsController',
function($scope, $rootScope, $routeParams, $location, $q, Address, StorageByAddress, getSocket, ContractsInfo, Transaction, Contracts, Constants, gettextCatalog) {

	var self = this;
	var addrStr;
	var socket = getSocket($scope);
	var hexString = '0000000000000000000000000000000000000000000000000000000000000000';
	self.storageViews = [ 'data', 'string', 'number', 'address' ];
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
				var i = 0; 
				var l = hex.length;

				if (hex.substring(0, 2) === '0x') {
					i = 2;
				}

				for ( ; i < l; i += 2) {

					newValue += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
				}
				
				return newValue;
			}
			case 'number': {
				return parseInt(hex, 16);
			}
			case 'address': {
				return hex.substr(-40);
			}
			default: {
				return hex;
			}
		}
	};

	var _defineDefaultState = function(string, number, address){

		if(string.match(/[a-zA-Z0-9;:'".,\/\]\[?!&%#@)(-_`><\s]+[a-zA-Z0-9;:'".,\/\]\[?!&%#@)(_`><]{4}[a-zA-Z0-9;:'".,\/\]\[?!&%#@)(-_`><\s]+/g)){
			return self.storageViews[1];
		}

		if(+number.toFixed() === number && !~(number.toString().indexOf('e'))){
			return self.storageViews[2];
		}

		if(!~(address.indexOf('00000')) && address.match(/[a-f]+/g)){
			return self.storageViews[3];
		}				

		return self.storageViews[0];
	};

	var _formStorageInfo = function() {

		var rows = [];

		for(var row in self.info.storage){
			for(var key in self.info.storage[ row ]){

				var fullHexDataValue = hexString.substr(self.info.storage[ row ][ key ].length).concat(self.info.storage[ row ][ key ]);
				var number_value = _parseStorageRowType(self.info.storage[ row ][ key ], 'number');
				var string_value = _parseStorageRowType(self.info.storage[ row ][ key ], 'string');
				var address_value = _parseStorageRowType(fullHexDataValue, 'address');
				
				var fullHexDataKey = hexString.substr(key.length).concat(key);
				var number_key = _parseStorageRowType(key, 'number');
				var string_key = _parseStorageRowType(key, 'string');
				var address_key = _parseStorageRowType(fullHexDataKey, 'address');				

				rows.push({
					values: {
						data: fullHexDataValue,
						number: number_value,
						string: string_value,
						address: address_value,
						state: _defineDefaultState(string_value, number_value, address_value),
					},
					keys: {
						data: fullHexDataKey,
						number: number_key,
						string: string_key,
						address: address_key,
						state: _defineDefaultState(string_key, number_key, address_key)
					}
				});
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
		
		if(Math.floor(currentStateNumber / (self.storageViews.length - 1))){
			
			self.storage.rows[ index ][ stateType ].state = self.storageViews[0];
			return;
		}
		self.storage.rows[ index ][ stateType ].state = self.storageViews[ currentStateNumber + 1 ];
	};

	self.showMoreStorageRows = function(limit){

		self.storage.viewRows = limit;
	};
});