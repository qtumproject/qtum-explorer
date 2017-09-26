'use strict';

angular.module('insight.statistics').controller('StatisticsController',
function($scope, $routeParams, Statistics, StatisticsByDaysTransactions, StatisticsByDaysOutputs, StatisticsByDaysFees, StatisticsByDaysDifficulty, StatisticsByDaysStakes, Statistics24Hours, MarketPrice, gettextCatalog, $filter, Constants) {

	var self = this;
	var factories = {
		'transactions' : {
			factory : StatisticsByDaysTransactions,
			field : 'transaction_count'
		},
		'outputs' : {
			factory : StatisticsByDaysOutputs,
			field : 'sum'
		},
		'fees' : {
			factory : StatisticsByDaysFees,
			field : 'fee'
		},
		'difficulty' : {
			factory : StatisticsByDaysDifficulty,
			field : 'sum'
		},
		'stakes' : {
			factory : StatisticsByDaysStakes,
			field : 'sum'
		}
	};
		self.chartOptions = {
			series : ['Test'],
			datasetOverride : [{
				defaultFontFamily: 'SimplonMono',
				yAxisID: 'y-axis-1' ,
				borderColor: '#2e9ad0',
				borderWidth: 1,
				pointBorderColor: '#2e9ad0',
				pointBackgroundColor: '#2e9ad0',
				pointBorderWidth: 0,
				pointRadius: 0,
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
					cornerRadius: 3,
					displayColors: false,
					callbacks: { }
				},
				layout: {
					padding: {
						left: 25
					}
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
							offsetGridLines: true,
							zeroLineColor: '#26475b'
						},
						ticks: {
							fontColor:'#2e9ad0',
							fontFamily: 'SimplonMono',
							fontSize: 14,
							padding: 20
						}
					}],
					xAxes: [{
						type: 'time',
						time: {
							unit: $routeParams.days > 60 || $routeParams.days == 'all' ? 'month' : 'day',
							displayFormats: {
								month: "MMM'DD",
								day: "MMM'DD"
							},
							max: Date.now()
						},
						gridLines: {
							color: '#26475b',
							drawBorder: false,
							drawOnChartArea: false,
							drawTicks: true,
							zeroLineColor: '#26475b'
						},
						ticks: {
							fontColor: '#2e9ad0',
							fontSize: 10,
							fontFamily: 'SimplonMono'
						}
					}]
				}
			}
		};
		self.daysButtons = [
			{
				days: 30,
				name: '30 ' + gettextCatalog.getString('Days')
			},
			{
				days: 60,
				name: '60 ' + gettextCatalog.getString('Days')
			},
			{
				days: 180,
				name: '180 ' + gettextCatalog.getString('Days')
			},
			{
				days: 365,
				name: '1 ' + gettextCatalog.getString('Year')
			},
			{
				days: 730,
				name: '2 ' + gettextCatalog.getString('Years')
			},
			{
				days: 'all',
				name:  gettextCatalog.getString('All Time')
			}
		];

		self.chartText = {
			fees: gettextCatalog.getString('The total value of all transaction fees paid to miners (not including the coinbase value of block rewards).'),
			transactions: gettextCatalog.getString('The number of daily confirmed Bitcoin transactions.'),
			outputs: gettextCatalog.getString('The total value of all transaction outputs per day (includes coins returned to the sender as change).'),
			difficulty: gettextCatalog.getString('A relative measure of how difficult it is to find a new block. The difficulty is adjusted periodically as a function of how much hashing power has been deployed by the network of miners.'),
			stakes: gettextCatalog.getString('')
		};
		self.chartDays = $routeParams.days;
		self.chartType = $routeParams.type;
		self.marketCurrency = Constants.CURRENCY.USD;
		self.marketPrice;		

	var _loadDifficulties = function(factory, itemField, itemName) {

		factory.query({
			days : $routeParams.days
		}, function(response){

			while(response.length < $routeParams.days){

				var emptyItem = {};

				emptyItem.date = moment().subtract($routeParams.days - ($routeParams.days - response.length), 'days').format('YYYY-MM-DD');
				emptyItem[ itemField ] = 0;

				response.push(emptyItem);
			}

			response.reverse();
			
			self.chartOptions.labels = response.map(function(item) {

				return item.date;
			});
			self.chartOptions.data = response.map(function(item) {

				return item[ itemField ];
			});
			self.chartOptions.options.scales.yAxes[0].ticks.callback = function(value){

				return $filter('numeraljs')(value, '0,0');
			};
			self.chartOptions.series = [ itemName ];
			self.chartOptions.options.tooltips.callbacks.beforeTitle = function(text) {

				text[0].yLabel = itemName.charAt(0).toUpperCase() + itemName.substr(1) + ': ' + $filter('numeraljs')(text[0].yLabel, '0,0.[00000000]');
			};
			self.difficultiesChartStats = response;
		});
	};

	var _changeChartColor = function(chart){

		var ctx = chart.chart.ctx;
		var gradient = ctx.createLinearGradient(0, 0, 0, 600);

		gradient.addColorStop(0, 'rgba(46, 154, 208,0.5)');
		gradient.addColorStop(1, 'rgba(0, 0, 0,0.001)');
		chart.chart.config.data.datasets[0].backgroundColor = gradient;
	}; 

	$scope.$on('chart-create', function (evt, chart) {

		if (chart.chart.canvas.id === 'line') {

			_changeChartColor(chart);
			chart.update();
		}
	});

	self.getDifficulties = function(){

		_loadDifficulties(factories[ $routeParams.type ].factory, factories[ $routeParams.type ].field, $routeParams.type);
	};

	self.get24HoursStats = function() {

		Statistics24Hours.get(function(response) {

			self.statsTotal24 = response;
		});

		MarketPrice.get(function(marketResponse) {
			
			self.marketPrice = marketResponse.USD;
		});		
	};
});


