'use strict';

var TRANSACTION_DISPLAYED = 10;
var BLOCKS_DISPLAYED = 5;

angular.module('insight.system').controller('IndexController',
	function($scope, $timeout, getSocket, Blocks) {

		var self = this;
			self.txs = [];
			self.blocks = [];
			self.scrollConfig = {
				autoHideScrollbar: false,
				theme: 'custom',
				advanced: {
					updateOnContentResize: true
				},
				scrollInertia: 0
			};

		var _getBlocks = function(limit) {
			Blocks.get({
				limit: limit ? limit : BLOCKS_DISPLAYED
			}, function(res) {

				self.blocks = res.blocks;
				self.blocksLength = res.length;
			});
		};

		$scope.$watch(function(){

			if($scope.updateScrollbar){
				$scope.updateScrollbar();
			}
		});

		var socket = getSocket($scope);

		var _startSocket = function() {

			socket.emit('subscribe', 'inv');
			socket.on('tx', function(tx) {

				tx.createTime = Date.now();
				self.txs.unshift(tx);

				if (self.txs.length > TRANSACTION_DISPLAYED) {
					
					self.txs.length = TRANSACTION_DISPLAYED;
				}
			});

			socket.on('block', function() {
				_getBlocks();
			});
		};

		socket.on('connect', function() {
			_startSocket();
		});

		self.index = function() {

			_getBlocks();
			_startSocket();
		};
	});
