'use strict';

angular.module('insight.contracts').controller('ContractsController',
function($scope, $rootScope, $routeParams, $location, $q, Address, StorageByAddress, getSocket, ContractsInfo, Transaction, Contracts) {

	var self = this;
	var addrStr;
	var socket = getSocket($scope);
	self.storageViews = [ 'data', 'string', 'number', 'address' ];
		self.storageSmartMode = true;
		self.storageState = { };

	try {
		addrStr = Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr);
	}
	catch (e) {

		$rootScope.flashMessage = 'Invalid Address: ' + $routeParams.contractAddressStr;
		$location.path('/');

		return false;
	}

	var _setStorageState = function() {

		for(var I in self.info.storage){

			self.storageState[I] = 0;
		}
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

	var _parseStorage = function(hex, type) {

		var newValue;

		switch (type){

			case 'string': {

				var newValue = '';

				for (var i = 0; i < hex.length; i += 2) {

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
		// console.log(parseInt( self.info.storage['04'], 16)); // toNumber
		// console.log(string); // to String
		// console.log(self.info.storage['02'].substr(-40)); // to addr
	}

	socket.on('connect', function() {

		_startSocket();
	});

	$scope.$on('$destroy', function(){

		_stopSocket();
	});

	self.params = $routeParams;

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
			self.info.storageLength = Object.keys(self.info.storage).length;
			_setStorageState();
			console.log(self.address, '============================================', self.info)
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

	self.toggleStorageRowView = function(key) {

		if(self.storageState[ key ] + 1 < self.storageViews.length){

			self.storageState[ key ] += 1;
			return;
		}
		self.storageState[ key ] = 0;		
	};

	self.getStorage = function() {

		StorageByAddress.get({
			address: $routeParams.contractAddressStr
		}, function(response) {

			_parseStorage();

			self.storage = response;
		});
	};
});