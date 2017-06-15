'use strict';

angular.module('insight.networks')
	.factory('Networks',
		function(Constants, Bitcorelib) {
			return {
				getCurrentNetwork: function () {
					return Bitcorelib.Networks.get(Constants.NETWORK);
				}
			}
		});