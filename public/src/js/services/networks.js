'use strict';

angular.module('insight.networks')
	.factory('Networks',
		function(Config, Bitcorelib) {
			return {
				getCurrentNetwork: function () {
					return Bitcorelib.Networks.get(Config.NETWORK);
				}
			}
		});