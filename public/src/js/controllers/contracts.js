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

	var _formStorageInfo = function() {

		var rows = [];

		for(var row in self.info.storage){
			for(value in self.info.storage[ row ]){

				var fullHexData = hexString.substr(self.info.storage[ row ][ value ].length).concat(self.info.storage[ row ][ value ]);

				rows.push({
					key_data: value,
					value_data: fullHexData,
					value_number: _parseStorageRowType(self.info.storage[ row ][ value ], 'number'),
					value_string: _parseStorageRowType(self.info.storage[ row ][ value ], 'string'),
					value_address: _parseStorageRowType(fullHexData, 'address'),
					valueState: 0
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

	self.toggleStorageRowView = function(index) {

		if(self.storage.rows[ index ].valueState + 1 < self.storageViews.length){

			self.storage.rows[ index ].valueState += 1;
			return;
		}
		self.storage.rows[ index ].valueState = 0;		
	};

	self.showMoreStorageRows = function(limit){

		self.storage.viewRows = limit;
	};
});