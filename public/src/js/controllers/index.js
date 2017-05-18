'use strict';

var TRANSACTION_DISPLAYED = 10;
var BLOCKS_DISPLAYED = 5;

angular.module('insight.system').controller('IndexController',
	function($scope, Global, getSocket, Blocks) {

		$scope.global = Global;
		$scope.paneConf = {
			autoReinitialise : true
		}

		var _getBlocks = function() {
			Blocks.get({
				limit: BLOCKS_DISPLAYED
			}, function(res) {

				$scope.blocks = res.blocks;
				$scope.blocksLength = res.length;
			});
		};

		var socket = getSocket($scope);

		var _startSocket = function() {

			socket.emit('subscribe', 'inv');
			socket.on('tx', function(tx) {

				tx.createTime = Date.now() / 1000;
				$scope.txs.unshift(tx);

				$scope.txs = $scope.txs.map(function (tx) {

					return {
						isRBF: tx.isRBF,
						createTime: tx.createTime,
						time: $scope.humanSince(tx.createTime),
						txid: tx.txid,
						valueOut: tx.valueOut,
						vout: tx.vout
					};
				});

				if ($scope.txs.length > TRANSACTION_DISPLAYED) {
					
					$scope.txs.length = TRANSACTION_DISPLAYED;
				}
			});

			socket.on('block', function() {
				_getBlocks();
			});
		};

		socket.on('connect', function() {
			_startSocket();
		});

		

		$scope.humanSince = function(time) {
			var m = moment.unix(time);
			return m.max().fromNow();
		};

		$scope.index = function() {
			_getBlocks();
			_startSocket();
		};

		$scope.txs = [];
		$scope.blocks = [];
	});
