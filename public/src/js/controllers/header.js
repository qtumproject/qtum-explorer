'use strict';

angular.module('insight.system').controller('HeaderController',
function($scope, $rootScope, $route, gettextCatalog, amMoment, getSocket, Block, $templateCache, Constants, $location) {

	var self = this;
	var socket = getSocket($scope);
	self.defaultLanguage = Constants.DEFAULT_LANGUAGE;

	self.menu = _getMenu();

	self.isActiveMenuItem = function (item) {
        return $location.path().search(item) !== -1 ? 'active': ''
	};

	function _getMenu() {
		return [
            {
                'title': gettextCatalog.getString('Blocks'),
                'link': 'blocks',
				'active_part': '/block'
            },
            {
                'title': gettextCatalog.getString('Status'),
                'link': 'status',
                'active_part': '/status'
            },
            {
                'title': gettextCatalog.getString('Stats'),
                'link': 'stats',
                'active_part': '/stats'
            },
            {
                'title': gettextCatalog.getString('Nodemap'),
                'link': Constants.NODEMAP_LINK,
                'active_part': '/nodemap'
            },
            {
                'title': gettextCatalog.getString('Charts'),
                'link': 'charts',
                'active_part': '/charts'
            },
            {
                'title': gettextCatalog.getString('Tokens'),
                'link': 'tokens/search',
                'active_part': '/token'
            },
            {
                'title': gettextCatalog.getString('Rich List'),
                'link': 'rich-list',
                'active_part': '/rich-list'
            }
        ];
	}

	self.availableLanguages = [
		{
			name: gettextCatalog.getString('Deutsch'),
			isoCode: 'de_DE'
		},
		{
			name: gettextCatalog.getString('English'),
			isoCode: 'en'
		},
		{
			name: gettextCatalog.getString('Spanish'),
			isoCode: 'es'
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
        self.menu = _getMenu();
		$route.reload();
	};

	$rootScope.isCollapsed = true;
});
