'use strict';

angular.module('insight.system').controller('IndexController',
function($scope, $rootScope, $window, $timeout, moment, getSocket, Blocks, TransactionsByDays, Constants, Status, $q, StatisticsTotalSupply, MarketsInfo) {

	var self = this;
	var socket = getSocket($scope);
		self.blockchainInfo = null;
		self.marketsInfo = {
            price_usd: 0,
            price_btc: 0,
            market_cap_usd: 0
		};
		self.txs = [];
		self.blocks = [];
		self.chartDays = Constants.CHART_DAYS;
		self.rewardCurrency = Constants.CURRENCY.QTUM;
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

					var maxHeight = parseInt($window.getComputedStyle(this).maxHeight),
						list = this.getElementsByClassName('mCSB_container'),
						heightList = list[0].clientHeight;

					if (heightList > maxHeight) {
						
						this.style.height = maxHeight + 'px';
					} 
					else {
						this.style.height = heightList + 'px';
					}
				}
			}
		};

		self.chartOptions = {
			series : [ 'Transactions' ],
			datasetOverride : [{
				yAxisID: 'y-axis-1' ,
				borderColor: '#2e9ad0',
				borderWidth: 1,
				fill: false,
				pointBorderColor: '#2e9ad0',
				pointBackgroundColor: '#2e9ad0',
				pointBorderWidth: 1,
				pointHoverBackgroundColor: '#e75647',
				pointHoverBorderColor: '#e75647',
				pointHoverBorderWidth: 1,
				pointHitRadius: 10,
				pointStyle: 'rect',
				lineTension: 0
			}],
			options : {
				tooltips:{
					backgroundColor: '#2e9ad0',
					titleFontFamily: 'SimplonMono',
					titleFontSize: 12,
					titleFontStyle: '500',
					titleFontColor: '#232328',
					bodyFontFamily: 'SimplonMono',
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
							fontFamily: 'SimplonMono',
							fontSize:  14,
							padding: 25,
							callback: function(value) {
								return value + ' t';
							}
						}
					}],
					xAxes: [{
						gridLines: {
							color: '#26475b',
							drawBorder: false,
							drawOnChartArea: false,
							drawTicks: true,
							zeroLineColor: '#26475b'
						},
						ticks: {
							fontColor:'#2e9ad0',
							fontSize: 10,
							fontFamily: 'SimplonMono'
						}
					}]
				}
			}
		};

	var _getBlocks = function() {

		Blocks.get({
			limit: Constants.BLOCKS_DISPLAYED
		}, function(res) {

			self.blocks = res.blocks;
			self.blocksLength = res.length;
		});
	};

	var socketRequestTimer = null;

	var _startSocket = function() {

		socket.emit('subscribe', 'inv');
		socket.on('tx', function(tx) {

			tx.createTime = Date.now();
			self.txs.unshift(tx);

			if (self.txs.length > Constants.TRANSACTION_DISPLAYED) {
				self.txs.length = Constants.TRANSACTION_DISPLAYED;
			}

		});

		socket.on('info', function(data) {
            self.blockchainInfo = data.info;
            self.blockchainInfo.supply = data.supply;
            self.blockchainInfo.stakingInfo = data.stakingInfo;
		});

		socket.on('block', function() {

            clearTimeout(socketRequestTimer);

            socketRequestTimer = setTimeout(function () {
                _getBlocks();
			}, Math.random() * 2000); //prevent waterfall

		});

		socket.on('markets_info', function(marketsInfo) {
           self.marketsInfo = marketsInfo;
		});

	};

	socket.on('connect', function() {
		_startSocket();
	});

	self.getListOfTransactions = function() {

		TransactionsByDays.query({ 
			days: self.chartDays 
		},
		function(response){

			while(response.length < self.chartDays){

				response.push({
					date : moment().subtract(self.chartDays - (self.chartDays - response.length), 'days').format('YYYY-MM-DD'),
					transaction_count: 0
				});
			}

			self.lastTransactionsList = response.reverse();
			self.chartOptions.labels = self.lastTransactionsList.map(function(item){

				return moment(item.date).format('MM/DD');
			});
			self.chartOptions.data = [ self.lastTransactionsList.map(function(item){

				return item.transaction_count;
			})];
		});
	};

    var _getInfo = function() {

        $q.all([Status.get({
            q: 'getInfo'
        }).$promise, StatisticsTotalSupply.get({format: 'object'}).$promise, Status.get({
            q: 'getStakingInfo'
        }).$promise]).then(function (results) {
            if (results[0] && results[1] && results[2]) {
                self.blockchainInfo = results[0].info;
                self.blockchainInfo.stakingInfo = results[2];
                self.blockchainInfo.supply = results[1].supply;
			}
        });

    };

    var _getMarketsInfo = function () {
        return MarketsInfo.get({}, function(response) {
        	if (response) {
        		self.marketsInfo = response;
			}
		});
	};

	self.index = function() {
		_getInfo();
		_getMarketsInfo();
		_getBlocks();
		_startSocket();
	};

});