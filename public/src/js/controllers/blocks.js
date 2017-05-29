'use strict';

angular.module('insight.blocks').controller('BlocksController',
	function($scope, $rootScope, $routeParams, $location, Block, Blocks, BlockByHeight) {

	var self = this;
	self.loading = false;

	if ($routeParams.blockHeight) {

		BlockByHeight.get({
			blockHeight: $routeParams.blockHeight
		}, function(hash) {

			$location.path('/block/' + hash.blockHash);
		}, function() {

			$rootScope.flashMessage = 'Bad Request';
			$location.path('/');
		});
	}

	//Datepicker
	var _formatTimestamp = function (date) {

		var yyyy = date.getUTCFullYear().toString();
		var mm = (date.getUTCMonth() + 1).toString(); // getMonth() is zero-based
		var dd  = date.getUTCDate().toString();

		return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); //padding
	};

	$scope.$watch('dt', function(newValue, oldValue) {

		if (newValue !== oldValue) {

			$location.path('/blocks-date/' + _formatTimestamp(newValue));
		}
	});

	$scope.openCalendar = function($event) {

		$event.preventDefault();
		$event.stopPropagation();

		self.opened = true;
	};

	$scope.humanSince = function(time) {

		var m = moment.unix(time).startOf('day');
		var b = moment().startOf('day');

		return m.max().from(b);
	};

	$scope.list = function() {

		self.loading = true;

		if ($routeParams.blockDate) {

			self.detail = 'On ' + $routeParams.blockDate;
		}

		if ($routeParams.startTimestamp) {

			var d = new Date($routeParams.startTimestamp * 1000);
			var m = d.getMinutes();

			if (m < 10){ 

				m = '0' + m
			};

			self.before = ' before ' + d.getHours() + ':' + m;
		}

		$rootScope.titleDetail = $scope.detail;

		Blocks.get({
			blockDate: $routeParams.blockDate,
			startTimestamp: $routeParams.startTimestamp
		}, function(res) {
			
			self.loading = false;
			self.blocks = res.blocks;
			self.pagination = res.pagination;
		});
	};

	self.findOne = function() {

		self.loading = true;

		Block.get({
			blockHash: $routeParams.blockHash
		}, function(block) {

			$rootScope.titleDetail = block.height;
			$rootScope.flashMessage = null;
			self.loading = false;
			self.block = block;
		}, function(e) {

			if (e.status === 400) {

				$rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
			}
			else if (e.status === 503) {

				$rootScope.flashMessage = 'Backend Error. ' + e.data;
			}
			else {
				$rootScope.flashMessage = 'Block Not Found';
			}

			$location.path('/');
		});
	};

	self.params = $routeParams;
});
