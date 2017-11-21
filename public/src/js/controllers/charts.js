'use strict';


angular.module('insight.charts').controller('ChartsController', function($scope, $routeParams, BigNumber, StatisticsBalanceIntervals, StatisticsByDaysSupply, StatisticsRicherThan, MarketsInfo, getSocket, $q, StatisticChart) {

        var self = this;

        self.chartDays = $routeParams.days ? $routeParams.days : 60;

        var statisticChart = new StatisticChart(self.chartDays);
        statisticChart.load(StatisticsByDaysSupply, 'sum', 'supply', false);

        $scope.$on('chart-create', function (evt, chart) {

            if (chart.chart.canvas.id === 'line') {

                statisticChart.changeChartColor(chart);

                chart.update();

            }
        });


        self.chartOptions = statisticChart.chartOptions;
        self.daysButtons = statisticChart.daysButtons;

        self.balanceIntervals = [];
        self.marketsInfo = null;
        self.richerThanIntervals = [];

        var socket = getSocket($scope);



        self.init = function() {
            _getInfo();
            _getRicherThan();
        };

        var _getRicherThan = function () {
            return StatisticsRicherThan.query(function (intervals) {
                self.richerThanIntervals = intervals;
            })
        };

        var _getInfo = function() {
            return $q.all([StatisticsBalanceIntervals.query().$promise, MarketsInfo.get().$promise]).then(function (results) {
                if (results[0] && results[1]) {

                    self.marketsInfo = results[1];

                    var items = results[0],
                        intervals = [],
                        countAddresses = 0,
                        maxCountAddresses = 0,
                        sumCoins = new BigNumber(0),
                        maxSumCoins = new BigNumber(0);

                    items.forEach(function (interval) {

                        var sumBN = new BigNumber(interval.sum.toString());

                        countAddresses += interval.count;

                        if (interval.count > maxCountAddresses) {
                            maxCountAddresses = interval.count;
                        }

                        sumCoins = sumCoins.plus(sumBN);

                        if (maxSumCoins.lt(sumBN)) {
                            maxSumCoins = new BigNumber(sumBN);
                        }

                    });

                    items.forEach(function (interval) {

                        var addressesPercent = interval.count && countAddresses ? interval.count / countAddresses * 100 : 0;
                        var addressesRelativePercent = interval.count && maxCountAddresses ? interval.count / maxCountAddresses * 100 : 0;

                        var sumBN = new BigNumber(interval.sum.toString());

                        var coinsPercent =  sumBN.gt(0) && sumCoins.gt(0) ? sumBN.dividedBy(sumCoins).mul(100) : new BigNumber(0);
                        var coinsRelativePercent = sumBN.gt(0) && maxSumCoins.gt(0) ? sumBN.dividedBy(maxSumCoins).mul(100) : new BigNumber(0);

                        intervals.push({
                            min: interval.min,
                            max: interval.max,
                            count: interval.count,
                            sum: sumBN.toString(10),
                            addressesPercent: addressesPercent.toFixed(2),
                            addressesRelativePercent: addressesRelativePercent.toFixed(2),
                            coinsPercent: coinsPercent.toNumber().toFixed(2),
                            coinsRelativePercent: coinsRelativePercent.toNumber().toFixed(2)
                        });

                    });

                    self.balanceIntervals = intervals;

                }

            });

        };

        socket.on('markets_info', function(marketsInfo) {
            self.marketsInfo = marketsInfo;
        });

    });