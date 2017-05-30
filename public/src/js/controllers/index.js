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
		self.chartOptions = {
			labels : ['4/22', '4/23','4/24','4/25', '4/26','4/27','4/28', '4/29','4/30','5/1', '5/2','5/23', '5/4','5/5', '5/6' ],
			series : ['Transactions'],
			data : [
				[75, 80, 60, 90, 78, 110, 60, 90, 80, 115,110,80, 100, 80,85]
			],
			datasetOverride : [{
				label: "Line chart",
				height: 130,
				yAxisID: 'y-axis-1' ,
				borderColor: '#2e9ad0',
				borderWidth: 1,
				fill: false,
				pointBorderColor: "#2e9ad0",
				pointBackgroundColor: "#2e9ad0",
				pointBorderWidth: 1,
				pointHoverBackgroundColor: "#e75647",
				pointHoverBorderColor: "#e75647",
				pointHoverBorderWidth: 1,
				pointHitRadius: 10,
				pointStyle: 'rect',
				lineTension: 0
			}],
			options : {
				tooltips:{
					backgroundColor: '#2e9ad0',
					titleFontFamily: "SimplonMono",
					titleFontSize: 12,
					titleFontStyle: '500',
					titleFontColor: '#232328',
					bodyFontFamily: "SimplonMono",
					bodyFontSize: 12,
					bodyFontStyle: '400',
					bodyFontColor: '#232328',
					caretSize: 5,
					cornerRadius: 0,
					displayColors: false
				},
				scales: {
					yAxes: [{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left',
						gridLines: {
							color: '#26475b',
							drawBorder: false,
							drawTicks: true,
							offsetGridLines:  true
						},
						ticks: {
							fontColor:'#2e9ad0',
							fontFamily: "SimplonMono",
							fontSize:  14,
							padding: 25,
							stepSize: 25,
							callback: function(value, index, values) {
								return value + ' k';
							}
						}
					}],
					xAxes: [{
						gridLines: {
							//display: false,
							color: '#26475b',
							drawBorder: false,
							drawOnChartArea: false,
							drawTicks: true,
							zeroLineColor: '#26475b'
						},
						ticks: {
							fontColor:'#2e9ad0',
							fontSize: 10,
							fontFamily: "SimplonMono"
						}
					}]
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

	self.chartClick = function (points, evt) {
		console.log(points, evt);
	}

	self.index = function() {

		_getBlocks();
		_startSocket();
	};
});
