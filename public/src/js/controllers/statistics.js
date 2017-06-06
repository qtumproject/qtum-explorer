'use strict';

angular.module('insight.statistics').controller('StatisticsController',
function($scope, $rootScope, $routeParams, Statistics, StatisticsByDays) {

	var self = this;
		self.difficultiesOptions = {
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
					displayColors: false
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
							offsetGridLines:  true,
							zeroLineColor: '#26475b'
						},
						ticks: {
							fontColor:'#2e9ad0',
							fontFamily: 'SimplonMono',
							fontSize:  14,
							padding: 20,
							stepSize: 500,
							callback: function(value) {

								return value + ' t';
							}
						}
					}],
					xAxes: [{
						type: 'time',
						time: {
							unit: $routeParams.days > 60 || $routeParams.days == 'all' ? 'month' : 'day',
							unitStepSize: 1,
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
							fontColor:'#2e9ad0',
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
				name: '30 Days'
			},
			{
				days: 60,
				name: '60 Days'
			},
			{
				days: 180,
				name: '180 Days'
			},
			{
				days: 365,
				name: '1 Year'
			},
			{
				days: 730,
				name: '2 Years'
			},
			{
				days: 'all',
				name: 'All Time'
			}
		];
		self.difficultyDays = $routeParams.days;

	self.getStats = function(){
		
		Statistics.query({}, function(response){

			self.stats = response;
		});
	};

	self.getDifficulties = function(){

		StatisticsByDays.query({
			days : $routeParams.days
		}, function(response){

			while(response.length < $routeParams.days){

				response.push({
					date : moment().subtract($routeParams.days - ($routeParams.days - response.length), 'days').format('YYYY-MM-DD'),
					transaction_count: 0
				});
			}

			self.difficultiesChartStats = response.reverse();
			self.difficultiesOptions.labels = 
			self.difficultiesChartStats.map(function(item) {

				return item.date;
			});
			self.difficultiesOptions.data = self.difficultiesChartStats.map(function(item) {

				return item.transaction_count;
			});

			self.difficultiesChartStats = response;
		});
	};
});


