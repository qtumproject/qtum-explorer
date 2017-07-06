'use strict';

angular.module('insight.contracts').controller('ContractsController',
function($scope, $rootScope, $routeParams, $location, $q, Address, StorageByAddress, getSocket, ContractsInfo, Transaction, Contracts, Constants, gettextCatalog) {

	var self = this;
	var addrStr;
	var socket = getSocket($scope);
	var hexString = '0000000000000000000000000000000000000000000000000000000000000000';
	self.storageViews = [ gettextCatalog.getString('data'), gettextCatalog.getString('string'), gettextCatalog.getString('number'), gettextCatalog.getString('address') ];
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
			return 1;
		}

		if(+number.toFixed() === number && !~(number.toString().indexOf('e'))){
			return 2;
		}

		if(!~(address.indexOf('00000')) && address.match(/[a-f]+/g)){
			return 3;
		}				

		return 0;
	};

	var _formStorageInfo = function() {

		var rows = [];

		for(var row in self.info.storage){
			for(var value in self.info.storage[ row ]){

				var fullHexDataValue = hexString.substr(self.info.storage[ row ][ value ].length).concat(self.info.storage[ row ][ value ]);
				var number_value = _parseStorageRowType(self.info.storage[ row ][ value ], 'number');
				var string_value = _parseStorageRowType(self.info.storage[ row ][ value ], 'string');
				var address_value = _parseStorageRowType(fullHexDataValue, 'address');
				
				var fullHexDataKey = hexString.substr(value.length).concat(value);
				var number_key = _parseStorageRowType(value, 'number');
				var string_key = _parseStorageRowType(value, 'string');
				var address_key = _parseStorageRowType(fullHexDataKey, 'address');				

				rows.push({
					value_data: fullHexDataValue,
					value_number: number_value,
					value_string: string_value,
					value_address: address_value,
					valueState: _defineDefaultState(string_value, number_value, address_value),
					key_data: fullHexDataKey,
					key_number: number_key,
					key_string: string_key,
					key_address: address_key,
					keyState: _defineDefaultState(string_key, number_key, address_key)
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

		if(self.storage.rows[ index ][ stateType ] + 1 < self.storageViews.length){

			self.storage.rows[ index ][ stateType ] += 1;
			return;
		}
		self.storage.rows[ index ][ stateType ] = 0;		
	};

	self.showMoreStorageRows = function(limit){

		self.storage.viewRows = limit;
	};
});