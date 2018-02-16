'use strict';

angular.module('insight', [
	'ngResource',
	'ngRoute',
	'ngLodash',
	'ui.bootstrap',
	'ui.route',
	'monospaced.qrcode',
	'gettext',
	'angularMoment',
	'insight.system',
	'insight.socket',
	'insight.blocks',
	'insight.chart',
	'insight.charts',
	'insight.richList',
	'insight.transactions',
	'insight.address',
	'insight.search',
	'insight.statistics',
	'insight.status',
	'insight.markets',
	'insight.connection',
	'insight.currency',
	'insight.messages',
	'insight.qtumcorelib',
	'insight.bignumber',
	'insight.solidity_coder',
	'insight.web3_utils',
	'insight.contracts',
	'insight.opcodes',
	'insight.networks',
	'insight.token'
]);

angular.module('insight.system', ['ngScrollbars', 'chart.js']);
angular.module('insight.socket', []);
angular.module('insight.blocks', []);
angular.module('insight.charts', []);
angular.module('insight.chart', []);
angular.module('insight.richList', []);
angular.module('insight.transactions', ['ngScrollbars']);
angular.module('insight.address', []);
angular.module('insight.search', []);
angular.module('insight.token', ['ngNumeraljs']);
angular.module('insight.statistics', ['ngNumeraljs']);
angular.module('insight.status', []);
angular.module('insight.markets', []);
angular.module('insight.connection', []);
angular.module('insight.currency', []);
angular.module('insight.messages', []);
angular.module('insight.messages', []);
angular.module('insight.qtumcorelib', []);
angular.module('insight.contracts', []);
angular.module('insight.opcodes', []);
angular.module('insight.networks', []);
angular.module('insight.solidity_coder', []);
angular.module('insight.web3_utils', []);
angular.module('insight.bignumber', []);

