'use strict';

angular.module('insight.statistics').controller('StatisticsController',
function($scope, $routeParams, Statistics, StatisticsByDays) {

	var self = this;
		self.difficultiesParams = {
			labels : ['1','2','3','4','5','6','7','8','9','10','11','12' ],
			series : ['Test'],
			data : [
				[200, 220,220, 250, 250,300,300, 350,360,360,375,380, 300,300, 350, 300, 450, 400, 550]
			],
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
							stepSize: 50,
							callback: function(value) {

								return value +',000,000,000';
							}
						}
					}],
					xAxes: [{
						type: 'time',
						time: {
							unit: 'month',
							displayFormats: {
								month: "MMM'DD"
							}
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
				days: 360,
				name: '1 Year'
			},
			{
				days: 720,
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

			self.difficultiesChartStats = response;
		});
	};
});


