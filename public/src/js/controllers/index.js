'use strict';

var TRANSACTION_DISPLAYED = 10;
var BLOCKS_DISPLAYED = 2;

angular.module('insight.system').controller('IndexController',
	function($scope, $timeout, getSocket, Blocks) {

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
			self.scrollSizeChangeCounter = 0;

		var _getBlocks = function(limit) {
			Blocks.get({
				limit: limit ? limit : BLOCKS_DISPLAYED
			}, function(res) {

				self.blocks = res.blocks;
				self.blocksLength = res.length;
				self.scrollSizeChangeCounter++;
			});
		};

		$timeout(function(){

			_getBlocks(10)
		},2000)

		$scope.$watch(function(newValue){

			if($scope.updateScrollbar){
				$scope.updateScrollbar(self.blocksLength);
			}
		});

		var socket = getSocket($scope);

		var _startSocket = function() {

			socket.emit('subscribe', 'inv');
			socket.on('tx', function(tx) {

				tx.createTime = Date.now();
				self.txs.unshift(tx);
				self.scrollSizeChangeCounter++;

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
