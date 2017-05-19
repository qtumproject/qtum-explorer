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


angular.module("ngJScrollPane", [ 'ng.deviceDetector' ]);
angular.module("ngJScrollPane")
	.directive("scrollPane", [ '$timeout', '$window', 'deviceDetector', function($timeout, $window, deviceDetector) {
		return {
			restrict: 'A',
			transclude: true,
			scope: {
				'transSize'	: '@transSize',
				'blocksSize': '@blocksSize'
			},
			template: '<div class="scroll-pane"><div ng-transclude></div></div>',
			link: function($scope, $elem, $attrs, controller) {

				var config = {};
				var selector = "#" + $attrs.id;
				var fn = function() {

					jQuery(selector).jScrollPane(config);
					$scope.pane = jQuery(selector).data("jsp");
				};
				var resize = function(){

					$scope.$broadcast('reinit-pane', $attrs.id);
				};

				if ($attrs.scrollConfig) {

					config = $scope.$eval($attrs.scrollConfig);
				}
				if ($attrs.scrollName) {

					selector = "[scroll-name='" + $attrs.scrollName + "']";
				}
				// if ($attrs.scrollTimeout) {

				// 	$timeout(fn, $scope.$eval($attrs.scrollTimeout));
				// } else {
				// 	$timeout(fn, 0);
				// }
				
				$scope.$watch((function() {

					return $attrs.scrollAlwaysTop;
				}), function(newVal) {

					if (newVal && $scope.pane) {

						$scope.pane.scrollToY(0);
					}
				});

				$scope.$watch('blocksSize', function(newVal) {

					if(newVal > 6 && !$scope.pane){

						console.log(newVal)
						$timeout(function(){
							fn();
						}, 0);
					}
				});

				$scope.$watch('transSize', function(newVal) {

					if(newVal > 8){

						if(!$scope.pane) {
							// fn()
						}
						
						// $scope.$broadcast('reinit-pane', $attrs.id);
					}
				});

				$elem.on('DOMMouseScroll mousewheel onmousewheel', function(e){

					e.preventDefault();
				});

				$scope.$on('$destroy', function(){

					angular.element($window).off('resize', resize);
				});

				angular.element($window).on('resize', resize);
				
				return $scope.$on("reinit-pane", function(event, id) {
					if (id === $attrs.id && $scope.pane) {
						
						// return (
							// $scope.$apply(function() {
								// console.log("Reinit pane " + id);
								$scope.pane.destroy();
								fn();
							// });
						// )
					}
				});
			},
			replace: true
		};
	}
]);