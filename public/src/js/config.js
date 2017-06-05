'use strict';

angular.module('insight')
.constant('Config', {

	NETWORK: 'testnet',//TODO::config
})
.constant('Constants', {

	CURRENCY: {
		QTUM : 'QTUM',
		USD : 'USD',
		mBTC : 'mBTC',
		bits : 'bits'
	},
	QRCOLOR : { 
		color: '#2e9ad0',
		background: '#232328'
	},
	BLOCKS_AMOUNT: 15,
	TRANSACTION_DISPLAYED: 10,
	BLOCKS_DISPLAYED: 5,
	CHART_DAYS: 14,
	STORAGE_ROWS: 5
});

//Setting up route
angular.module('insight').config(function($routeProvider) {
	$routeProvider.
	when('/block/:blockHash', {
		templateUrl: 'views/block.html',
		title: 'Quantum Block '
	}).
	when('/block-index/:blockHeight', {
		controller: 'BlocksController',
		templateUrl: 'views/redirect.html'
	}).
	when('/tx/send', {
		templateUrl: 'views/transaction_sendraw.html',
		title: 'Broadcast Raw Transaction'
	}).
	when('/tx/:txId/:v_type?/:v_index?', {
		templateUrl: 'views/transaction.html',
		title: 'Quantum Transaction '
	}).
	when('/', {
		templateUrl: 'views/index.html',
		title: 'Home'
	}).
	when('/blocks', {
		templateUrl: 'views/block_list.html',
		title: 'Quantum Blocks solved Today'
	}).
	when('/blocks-date/:blockDate/:startTimestamp?', {
		templateUrl: 'views/block_list.html',
		title: 'Quantum Blocks solved '
	}).
	when('/address/:addrStr', {
		templateUrl: 'views/address.html',
		title: 'Quantum Address '
	}).
	when('/contracts/:contractAddressStr', {
		templateUrl: 'views/contract.html',
		title: 'Quantum Contract '
	}).
	when('/status', {
		templateUrl: 'views/status.html',
		title: 'Status'
	}).
	when('/messages/verify', {
		templateUrl: 'views/messages_verify.html',
		title: 'Verify Message'
	}).
	when('/stats', {
		templateUrl: 'views/statistics.html',
		title: 'Stats'
	}).
	when('/difficulty/:days', {
		controller: 'StatisticsController',
		templateUrl: 'views/difficulty.html',
		title: 'Difficulty'
	})
	.otherwise({
		templateUrl: 'views/404.html',
		title: 'Error'
	});
});

//Setting HTML5 Location Mode
angular.module('insight')
	.config(function($locationProvider) {
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
	})
	.run(function($rootScope, $route, $location, $routeParams, $anchorScroll, gettextCatalog, amMoment, Constants) {

		gettextCatalog.currentLanguage = defaultLanguage;
		amMoment.changeLocale(defaultLanguage);

		$rootScope.$on('$routeChangeSuccess', function() {

			//Change page title, based on Route information
			$rootScope.titleDetail = '';
			$rootScope.title = $route.current.title;
			$rootScope.isCollapsed = true;
			$rootScope.currentAddr = null;
			$rootScope.Constants = Constants;

			$location.hash($routeParams.scrollTo);
			$anchorScroll();
		});
	});
