'use strict';

angular.module('insight')
	.directive('scroll', function ($window) {

		return function(scope, element, attrs) {
			angular.element($window).bind('scroll', function() {
				if (this.pageYOffset >= 200) {
					scope.secondaryNavbar = true;
				} else {
					scope.secondaryNavbar = false;
				}
				scope.$apply();
			});
		};
	})
	.directive('whenScrolled', function($window) {
		return {
			restric: 'A',
			link: function(scope, elm, attr) {
				var pageHeight, clientHeight, scrollPos;
				$window = angular.element($window);

				var handler = function() {
					pageHeight = window.document.documentElement.scrollHeight;
					clientHeight = window.document.documentElement.clientHeight;
					scrollPos = window.pageYOffset;

					if (pageHeight - (scrollPos + clientHeight) === 0) {
						scope.$apply(attr.whenScrolled);
					}
				};

				$window.on('scroll', handler);

				scope.$on('$destroy', function() {
					return $window.off('scroll', handler);
				});
			}
		};
	})
	.directive('focus', function ($timeout) {
		return {
			scope: {
				trigger: '@focus'
			},
			link: function (scope, element) {
				scope.$watch('trigger', function (value) {
					if (value === "true") {
						$timeout(function () {
							element[0].focus();
						});
					}
				});
			}
		};
	})
	.directive('ngclipboard', [ '$timeout', '$window', 'gettextCatalog', function($timeout, $window, gettextCatalog) {
		return {
			restrict: 'A',
			scope: {
				ngclipboardSuccess: '&',
				ngclipboardError: '&'
			},
			transclude: true,
			link: function(scope, element) {

				var clipboard = new $window.Clipboard(element[0]);
				var translate = gettextCatalog.getString('Copied');
				var copiedElement = angular.element('<div class="copied">' + translate + '</div>');

				element.before(copiedElement);

				clipboard.on('success', function(e) {
				scope.$apply(function () {

						copiedElement.addClass('active');

						$timeout(function(){

							copiedElement.removeClass('active');
						}, 2000);

						scope.ngclipboardSuccess({
							e: e
						});
					});
				});

				clipboard.on('error', function(e) {
					scope.$apply(function () {

						scope.ngclipboardError({
							e: e
						});
					});
				});
			}
		};
	}])
	.directive('tooltip', function() {
		return {
			restrict: 'A',
			scope: {
				tooltipTitle: '@',
				tooltipTitleVariable: '=',
				tooltipOptions: "="
			},
			link: function(scope, element, attrs) {

				var isTooltipDynamicVariable = (scope.tooltipTitleVariable !== undefined);

				if (!scope.tooltipTitle && !isTooltipDynamicVariable) {
					return;
				}
				
				var tooltipOptions = scope.tooltipOptions || {};
				var message = scope.tooltipTitle;

				if (isTooltipDynamicVariable) {

					message = scope.tooltipTitleVariable;

					scope.$watch('tooltipTitleVariable', function(value) {

						element.tooltipster('content', value);

						if (!value) {

							element.tooltipster('disable');
						} 
						else {
							element.tooltipster('enable');
						}
					});
				}

				tooltipOptions.content = message;
				element.tooltipster(tooltipOptions);

				scope.$on("$destroy", function () {

					element.tooltipster('destroy');
				});
			}
		};	
	});