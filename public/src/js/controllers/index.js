'use strict';

angular.module('insight.system').controller('IndexController',
	function($scope, $rootScope, $timeout, getSocket, Blocks) {

		var self = this;
			self.txs = [];
			self.blocks = [];
			self.scrollConfig = {
				autoHideScrollbar: false,
				axis: 'y',
				theme: 'custom',
				advanced: {
					updateOnContentResize: true
				},
				scrollInertia: 0,
				callbacks: {
					onBeforeUpdate: function() {

						var maxHeight = parseInt(window.getComputedStyle(this).maxHeight),
							list = this.getElementsByClassName('scrollList'),
							heightList = list[0].clientHeight;

						if (heightList > maxHeight) {
							
							this.style.height = parseInt(window.getComputedStyle(this).maxHeight) + 'px';
						} else {
							this.style.height = heightList + 'px';
						}
					}
				}
			};

		var _getBlocks = function() {

			Blocks.get({
				limit: $rootScope.Constants.BLOCKS_DISPLAYED
			}, function(res) {

				self.blocks = res.blocks;
				self.blocksLength = res.length;
			});
		};

		var socket = getSocket($scope);

		var _startSocket = function() {

			socket.emit('subscribe', 'inv');
			socket.on('tx', function(tx) {

				tx.createTime = Date.now();
				self.txs.unshift(tx);

				if (self.txs.length > $rootScope.Constants.TRANSACTION_DISPLAYED) {
					
					self.txs.length = $rootScope.Constants.TRANSACTION_DISPLAYED;
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
