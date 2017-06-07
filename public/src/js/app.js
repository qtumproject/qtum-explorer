'use strict';


var defaultLanguage = localStorage.getItem('insight-language') || 'en';
var defaultCurrency = localStorage.getItem('insight-currency') || 'QTUM';

angular.module('insight',[
	'ngResource',
	'ngRoute',
	'ui.bootstrap',
	'ui.route',
	'monospaced.qrcode',
	'gettext',
	'angularMoment',
	'insight.system',
	'insight.socket',
	'insight.blocks',
	'insight.transactions',
	'insight.address',
	'insight.search',
	'insight.statistics',
	'insight.status',
	'insight.connection',
	'insight.currency',
	'insight.messages',
	'insight.bitcorelib',
	'insight.contracts',
	'insight.opcodes',
	'insight.networks'
]);

angular.module('insight.system', [ 'ngScrollbars', 'chart.js' ]);
angular.module('insight.socket', []);
angular.module('insight.blocks', []);
angular.module('insight.transactions', [ 'ngScrollbars' ]);
angular.module('insight.address', []);
angular.module('insight.search', []);
angular.module('insight.statistics', [ 'ngNumeraljs' ]);
angular.module('insight.status', []);
angular.module('insight.connection', []);
angular.module('insight.currency', []);
angular.module('insight.messages', []);
angular.module('insight.messages', []);
angular.module('insight.bitcorelib', []);
angular.module('insight.contracts', []);
angular.module('insight.opcodes', []);
angular.module('insight.networks', []);
