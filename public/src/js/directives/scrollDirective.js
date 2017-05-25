'use strict';

function render(defaults, configuredDefaults, elem, scope) {

	var config = {};
	elem.mCustomScrollbar('destroy');
	
	if (scope.ngScrollbarsConfig) {
		config = scope.ngScrollbarsConfig;
	}

	// apply configured provider defaults only if the scope's config isn't defined (it has priority in that case)
	for (var setting in defaults) {
		if (defaults.hasOwnProperty(setting)) {

			switch (setting) {

				case 'scrollButtons':
					if (!config.hasOwnProperty(setting)) {
						configuredDefaults.scrollButtons = defaults[setting];
					}
					break;

				case 'axis':
					if (!config.hasOwnProperty(setting)) {
						configuredDefaults.axis = defaults[setting];
					}
					break;

				default:
					if (!config.hasOwnProperty(setting)) {
						config[setting] = defaults[setting];
					}
					break;

			}
		}
	}

	elem.mCustomScrollbar(config);
}

angular.module('ngScrollbars', [])
.provider('ScrollBars', function() {
	this.defaults = {
		scrollButtons: {
		enable: true //enable scrolling buttons by default
		},
		axis: 'yx' //enable 2 axis scrollbars by default
	};

	// TODO: can we do this without jquery?
	$.mCustomScrollbar.defaults.scrollButtons = this.defaults.scrollButtons;
	$.mCustomScrollbar.defaults.axis = this.defaults.axis;

	this.$get = function ScrollBarsProvider() {
		return {
		defaults: this.defaults
		}
	}
})
.directive('ngScrollbars', function(ScrollBars) {
	return {
		scope: {
			ngScrollbarsConfig: '=?',
			ngScrollbarsUpdate: '=?',
			element: '=?'
		},
		link: function (scope, elem, attrs) {

			var defaults = ScrollBars.defaults;
			var configuredDefaults = $.mCustomScrollbar.defaults;
			scope.elem = elem;
			scope.ngScrollbarsConfig.setHeight = parseInt(window.getComputedStyle(elem[0]).maxHeight);

			scope.ngScrollbarsUpdate = function () {

				if(elem.find('.scrollList').outerHeight() > scope.ngScrollbarsConfig.setHeight){

					render(defaults, configuredDefaults, elem, scope);
				}
			};

			scope.$watch('ngScrollbarsConfig', function (newVal, oldVal) {

				if (newVal !== undefined && elem.find('.scrollList').outerHeight() > scope.ngScrollbarsConfig.setHeight) {

					render(defaults, configuredDefaults, elem, scope);
				}
			});

			if(elem.find('.scrollList').outerHeight() > scope.ngScrollbarsConfig.setHeight){

				render(defaults, configuredDefaults, elem, scope);
			}
		}
	};
});

// ScrollBarsProvider.$inject = [];
// ScrollBarsDirective.$inject = ['ScrollBars'];


// function ScrollBarsProvider() {
	// this.defaults = {
	// 	scrollButtons: {
	// 	enable: true //enable scrolling buttons by default
	// 	},
	// 	axis: 'yx' //enable 2 axis scrollbars by default
	// };

	// // TODO: can we do this without jquery?
	// $.mCustomScrollbar.defaults.scrollButtons = this.defaults.scrollButtons;
	// $.mCustomScrollbar.defaults.axis = this.defaults.axis;

	// this.$get = function ScrollBarsProvider() {
	// 	return {
	// 	defaults: this.defaults
	// 	}
	// }
	// }


	// function ScrollBarsDirective(ScrollBars) {
	// return {
	// 	scope: {
	// 	ngScrollbarsConfig: '=?',
	// 	ngScrollbarsUpdate: '=?',
	// 	element: '=?'
	// 	},
	// 	link: function (scope, elem, attrs) {

	// 	var defaults = ScrollBars.defaults;
	// 	var configuredDefaults = $.mCustomScrollbar.defaults;
	// 	scope.elem = elem;
	// 	scope.ngScrollbarsConfig.setHeight = parseInt(window.getComputedStyle(elem[0]).maxHeight);


	// 	scope.ngScrollbarsUpdate = function () {

	// 		if(elem.find('ul').outerHeight() > scope.ngScrollbarsConfig.setHeight){

	// 			render(defaults, configuredDefaults, elem, scope);
	// 		}
	// 	};

	// 	scope.$watch('ngScrollbarsConfig', function (newVal, oldVal) {
	// 		if (newVal !== undefined) {
	// 			if(elem.find('ul').outerHeight() > scope.ngScrollbarsConfig.setHeight){
	// 			render(defaults, configuredDefaults, elem, scope);
	// 			}
	// 		}
	// 	});

	// 	if(elem.find('ul').outerHeight() > scope.ngScrollbarsConfig.setHeight){

	// 		render(defaults, configuredDefaults, elem, scope);
	// 	}
	// 	}
	// };
	// }