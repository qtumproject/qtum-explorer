'use strict';

angular.module('insight.blocks').controller('BlocksController',
function($scope, $rootScope, $routeParams, $location, moment, Block, Blocks, BlockByHeight) {

	var self = this;
	self.loading = false;
	self.date = null;
	self.datepicker = {
		date: null,
		format: 'yyyy-MM-dd',
		isOpened : false,
		dateOptions : {
			startingDay: 1,
			maxDate: new Date(),
			minDate: new Date(0),
		}
	};

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

	$scope.$watch(function () {

		return self.date;
	}, function(newValue, oldValue, scope) {

		if (newValue !== oldValue && scope.BC.datepicker.isOpened) {

			self.datepicker.date = newValue.getTime();
			$location.path('/blocks-date/' + moment(newValue).format('YYYY-MM-DD'));
		}
	});

	self.openDatepicker = function(e) {

		e.preventDefault();
		e.stopPropagation();

		self.datepicker.isOpened = true;
	};

	self.disableDatepicker = function (data) {

		var date = data.date,
			mode = data.mode;

		return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
	};

	self.loadList = function() {

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

		$rootScope.titleDetail = self.detail;

		Blocks.get({
			blockDate: $routeParams.blockDate,
			startTimestamp: $routeParams.startTimestamp
		}, function(res) {
			
			self.loading = false;
			var date = new Date(res.pagination.current);
			self.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
			self.datepicker.date = self.date.getTime();
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

	self.calcDatesDifference = function() {
		
		var present = new Date();
		
		var presentDate = moment.utc([present.getUTCFullYear(), present.getUTCMonth(), present.getUTCDate()]);
		var currentDate = moment.utc(self.pagination.current);

		return currentDate.from(presentDate);
	}

	self.params = $routeParams;
});
