'use strict';

var ZeroClipboard = window.ZeroClipboard;

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
	.directive('clipCopy', function() {
		ZeroClipboard.config({
			moviePath: '/lib/zeroclipboard/ZeroClipboard.swf',
			trustedDomains: ['*'],
			allowScriptAccess: 'always',
			forceHandCursor: true
		});

		return {
			restric: 'A',
			scope: { clipCopy: '=clipCopy' },
			template: '<div class="tooltip fade right in"><div class="tooltip-arrow"></div><div class="tooltip-inner">Copied!</div></div>',
			link: function(scope, elm) {
				var clip = new ZeroClipboard(elm);

				clip.on('load', function(client) {
					var onMousedown = function(client) {
						client.setText(scope.clipCopy);
					};

					client.on('mousedown', onMousedown);

					scope.$on('$destroy', function() {
						client.off('mousedown', onMousedown);
					});
				});

				clip.on('noFlash wrongflash', function() {
					return elm.remove();
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
	});


	angular.module("ngJScrollPane", []);
	angular.module("ngJScrollPane").directive("scrollPane", [
		'$timeout', '$window', function($timeout, $window) {
			return {
				restrict: 'A',
				transclude: true,
				scope: {
					'transLength'	: '@transLength',
					'blocksLength'	: '@blocksLength'
				},
				template: '<div class="scroll-pane"><div ng-transclude></div></div>',
				link: function($scope, $elem, $attrs, controller) {

					var config, fn, selector, reinitialize, resize;
					config = {};
					selector = "#" + $attrs.id;

					fn = function() {

						jQuery(selector).jScrollPane(config);
						return $scope.pane = jQuery(selector).data("jsp");
					};

					reinitialize = function(selector){

						var pane = jQuery(selector).data("jsp");

						if(pane && $attrs.device === 'desktop'){

							$timeout(function(){

								jQuery(selector).data("jsp").destroy();
								jQuery(selector).jScrollPane(config);
							}, 100);
						}
					}

					resize = function(){

						reinitialize('#blocksPane');
						reinitialize('#transPane');
					}

					if ($attrs.scrollConfig) {

						config = $scope.$eval($attrs.scrollConfig);
					}
					if ($attrs.scrollName) {

						selector = "[scroll-name='" + $attrs.scrollName + "']";
					}
					if ($attrs.scrollTimeout) {

						$timeout(fn, $scope.$eval($attrs.scrollTimeout));
					} else {
						$timeout(fn, 0);
					}
					
					$scope.$watch((function() {

						return $attrs.scrollAlwaysTop;
					}), function(newVal, oldVal) {

						if (newVal && $scope.pane) {
							$scope.pane.scrollToY(0);
						}
					});

					$scope.$watch('blocksLength', function(newVal, oldVal) {

						reinitialize('#blocksPane');
					});

					$scope.$watch('transLength', function(newVal, oldVal) {

						reinitialize('#transPane');
					});

					$scope.$on('$destroy', function(){

						angular.element($window).off('resize', resize)
					});

					$elem.on('DOMMouseScroll mousewheel onmousewheel', function(e){

						e.preventDefault();
					});

					angular.element($window).on('resize', resize);

					return $scope.$on("reinit-pane", function(event, id) {
						if (id === $attrs.id && $scope.pane) {
							console.log("Reinit pane " + id);
							return $scope.$apply(function() {
								$scope.pane.destroy();
								return fn();
							});
						}
					});
				},
				replace: true
			};
		}
	]);