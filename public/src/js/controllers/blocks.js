'use strict';

angular.module('insight.blocks').controller('BlocksController',
	function($scope, $rootScope, $routeParams, $location, Block, Blocks, BlockByHeight) {

	var self = this;
	self.loading = false;
	self.date = new Date();
	self.datepicker = {
		date : self.date.getTime(),
		opened : false,
		format : 'yyyy-MM-dd',
		dateOptions : {
			maxDate: new Date(2020, 5, 22),
			minDate: new Date(),
			startingDay: 1
		}
	}
	self.paginationState = {
		page: 1,
		pagesLength: null,
		blocks: null
	}

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

	self.openDatepicker = function(e) {

		e.preventDefault();
		e.stopPropagation();

		self.datepicker.opened = true;
	}

	self.disableDatepicker = function (data) {

		var date = data.date,
			mode = data.mode;

		return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
	}

	self.setPage = function(page){

		self.paginationState.page = page;
		self.paginationState.blocks = self.blocks.slice((self.paginationState.page - 1) * $rootScope.Constants.BLOCKS_AMOUNT, self.paginationState.page * $rootScope.Constants.BLOCKS_AMOUNT);
	}

	self.list = function() {

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
			self.blocks = res.blocks;
			self.pagination = res.pagination;
			self.paginationState.pagesLength = Math.ceil(self.blocks.length / $rootScope.Constants.BLOCKS_AMOUNT);
			self.paginationState.blocks = self.blocks.slice(0, $rootScope.Constants.BLOCKS_AMOUNT);
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
