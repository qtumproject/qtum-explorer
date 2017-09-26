'use strict';

angular.module('insight.system').controller('HeaderController',
function($scope, $rootScope, $route, gettextCatalog, amMoment, getSocket, Block, $templateCache, Constants) {

	var self = this;
	var socket = getSocket($scope);
	self.defaultLanguage = Constants.DEFAULT_LANGUAGE;
	self.menu = [
		{
			'title': gettextCatalog.getString('Blocks'),
			'link': 'blocks'
		},
		{
			'title': gettextCatalog.getString('Status'),
			'link': 'status'
		},
		{
			'title': gettextCatalog.getString('Stats'),
			'link': 'stats'
		},
		{
			'title': 'Smart Contract',
			'link': 'contract'
		}
	];
	self.availableLanguages = [
		{
			name: gettextCatalog.getString('Deutsch'),
			isoCode: 'de_DE',
		},
		{
			name: gettextCatalog.getString('English'),
			isoCode: 'en',
		},
		{
			name: gettextCatalog.getString('Spanish'),
			isoCode: 'es',
		},
		{
			name: gettextCatalog.getString('Japanese'),
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

	self.setLanguage = function(isoCode) {

		var currentPageTemplate = $route.current.templateUrl;

		gettextCatalog.currentLanguage = self.defaultLanguage = isoCode;
		amMoment.changeLocale(isoCode);
		localStorage.setItem('insight-language', isoCode);
		$templateCache.remove(currentPageTemplate);
		$route.reload();
	};

	$rootScope.isCollapsed = true;
});
