'use strict';

angular.module('insight.address').controller('AddressController',
function($scope, $rootScope, $document, $routeParams, $location, Address, getSocket, Constants) {

	var self = this;
	var socket = getSocket($scope);
	var addrStr = $routeParams.addrStr;
	self.qrColors = {
		background: Constants.QRCOLOR.background,
		color: Constants.QRCOLOR.color
	};

	var _startSocket = function() {
		socket.on('bitcoind/addresstxid', function(data) {

			if (data.address === addrStr) {

				var base = $document.find('base');
				var beep = new Audio(base[0].href + '/sound/transaction.mp3');

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
