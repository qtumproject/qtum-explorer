'use strict';

angular.module('insight.address').controller('AddressController',
function($scope, $rootScope, $routeParams, $location, Address, getSocket) {

	var self = this;
	var socket = getSocket($scope);
	var addrStr = $routeParams.addrStr;
	self.QRCOLOR = { 
		color: '#2e9ad0',
		background: '#232328'
	};

	var _startSocket = function() {
		socket.on('bitcoind/addresstxid', function(data) {

			if (data.address === addrStr) {

				var base = document.querySelector('base');
				var beep = new Audio(base.href + '/sound/transaction.mp3');

				$rootScope.$broadcast('tx', data.txid);
				beep.play();
			}
		});
	
		socket.emit('subscribe', 'bitcoind/addresstxid', [addrStr]);
	};

	var _stopSocket = function () {

		socket.emit('unsubscribe', 'bitcoind/addresstxid', [addrStr]);
	};

	socket.on('connect', function() {

		_startSocket();
	});

	$scope.$on('$destroy', function(){

		_stopSocket();
	});

	self.params = $routeParams;

	self.findOne = function() {

		$rootScope.currentAddr = $routeParams.addrStr;
		_startSocket();

		Address.get({
			addrStr: $routeParams.addrStr
		},
		function(address) {

			$rootScope.titleDetail = address.addrStr.substring(0, 7) + '...';
			$rootScope.flashMessage = null;
			self.address = address;
		},
		function(e) {

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
});
