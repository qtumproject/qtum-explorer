'use strict';

angular.module('insight.system').controller('HeaderController',
function($scope, $rootScope, $route, $modal, gettextCatalog, amMoment, getSocket, Block, $templateCache) {

	var self = this;
	var socket = getSocket($scope);
	self.defaultLanguage = defaultLanguage;
	self.menu = [
		{
			'title': 'Blocks',
			'link': 'blocks'
		}, 
		{
			'title': 'Status',
			'link': 'status'
		}
	];
	self.availableLanguages = [
		{
			name: 'Deutsch',
			isoCode: 'de_DE',
		}, 
		{
			name: 'English',
			isoCode: 'en',
		}, 
		{
			name: 'Spanish',
			isoCode: 'es',
		}, 
		{
			name: 'Japanese',
			isoCode: 'ja'
		}
	];

	var _getBlock = function(hash) {
		Block.get({
			blockHash: hash
		}, function(res) {

			self.totalBlocks = res.height;
		});
	};
	
	socket.on('connect', function() {

		socket.emit('subscribe', 'inv');
		socket.on('block', function(block) {

			var blockHash = block.toString();
			_getBlock(blockHash);
		});
	});

	self.openScannerModal = function() {

		var modalInstance = $modal.open({
			templateUrl: 'scannerModal.html',
			controller: 'ScannerController'
		});
	};

	self.setLanguage = function(isoCode) {

		var currentPageTemplate = $route.current.templateUrl;

		gettextCatalog.currentLanguage = self.defaultLanguage = defaultLanguage = isoCode;
		amMoment.changeLocale(isoCode);
		localStorage.setItem('insight-language', isoCode);
		$templateCache.remove(currentPageTemplate);
		$route.reload();
	};

	$rootScope.isCollapsed = true;
});
