'use strict';

angular.module('insight.networks')
	.factory('Networks',
		function(Constants, QtumCoreLib) {
			return {
				getCurrentNetwork: function () {
					return QtumCoreLib.Networks.get(Constants.NETWORK);
				}
			}
		});