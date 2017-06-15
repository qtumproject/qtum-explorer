'use strict';

angular.module('insight.system').controller('HeaderController',
function($scope, $rootScope, $route, gettextCatalog, amMoment, getSocket, Block, $templateCache, Constants, gettext) {

	var self = this;
	var socket = getSocket($scope);
	self.defaultLanguage = Constants.DEFAULT_LANGUAGE;
	self.menu = [
		{
			'title': gettextCatalog.getString(gettext('Blocks')),
			'link': 'blocks'
		}, 
		{
			'title': gettextCatalog.getString(gettext('Status')),
			'link': 'status'
		}, 
		{
			'title': gettextCatalog.getString(gettext('Stats')),
			'link': 'stats'
		}
	];
	self.availableLanguages = [
		{
			name: gettextCatalog.getString(gettext('Deutsch')),
			isoCode: 'de_DE',
		}, 
		{
			name: gettextCatalog.getString(gettext('English')),
			isoCode: 'en',
		}, 
		{
			name: gettextCatalog.getString(gettext('Spanish')),
			isoCode: 'es',
		}, 
		{
			name: gettextCatalog.getString(gettext('Japanese')),
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
