'use strict';

angular.module('insight.system').controller('HeaderController',
	function($scope, $rootScope, $route, $modal, gettextCatalog, amMoment, getSocket, Global, Block, $templateCache) {

	$scope.global = Global;
	$scope.defaultLanguage = defaultLanguage;

	$rootScope.currency = {
		factor: 1,
		bitstamp: 0,
		symbol: 'QTUM'
	};

	$scope.menu = [{
		'title': 'Blocks',
		'link': 'blocks'
	}, {
		'title': 'Status',
		'link': 'status'
	}];

	$scope.availableLanguages = [{
		name: 'Deutsch',
		isoCode: 'de_DE',
	}, {
		name: 'English',
		isoCode: 'en',
	}, {
		name: 'Spanish',
		isoCode: 'es',
	}, {
		name: 'Japanese',
		isoCode: 'ja',
	}];

	$scope.openScannerModal = function() {
		var modalInstance = $modal.open({
			templateUrl: 'scannerModal.html',
			controller: 'ScannerController'
		});
	};

	var _getBlock = function(hash) {
		Block.get({
			blockHash: hash
		}, function(res) {
			$scope.totalBlocks = res.height;
		});
	};

	var socket = getSocket($scope);
	socket.on('connect', function() {
		socket.emit('subscribe', 'inv');

		socket.on('block', function(block) {
			var blockHash = block.toString();
			_getBlock(blockHash);
		});
	});

	$scope.setLanguage = function(isoCode) {

		var currentPageTemplate = $route.current.templateUrl;

		gettextCatalog.currentLanguage = $scope.defaultLanguage = defaultLanguage = isoCode;
		amMoment.changeLocale(isoCode);
		localStorage.setItem('insight-language', isoCode);
		$templateCache.remove(currentPageTemplate);
		$route.reload();
	};

	$rootScope.isCollapsed = true;
	});
