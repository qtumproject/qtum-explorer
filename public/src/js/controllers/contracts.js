'use strict';

angular.module('insight.contracts').controller('ContractsController',
    function($scope, $rootScope, $routeParams, $location,$q, Global, Address, getSocket, ContractsInfo, Transaction, Contracts, Bitcorelib) {
        $scope.global = Global;

        $scope.$on('$destroy', function(){

        });

        $scope.params = $routeParams;

        $scope.findOne = function() {

            $rootScope.contractAddressStr = $routeParams.contractAddressStr;

            $q.all([ContractsInfo.get({
                contractAddressStr: $routeParams.contractAddressStr
            }).$promise,Address.get({
                addrStr: Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr)
            }).$promise]).then(function(values) {
                var info = values[0];
                var address = values[1];

                $scope.info = info;
                $rootScope.flashMessage = null;
                $rootScope.titleDetail = $routeParams.contractAddressStr.substring(0, 7) + '...';
                $scope.opcodesStr = Contracts.getContractOpcodesString(info.code);
                $scope.bitAddress = Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr);
                $scope.address = address;

            }).catch(function (e) {
                if (e.status === 400) {
                    $rootScope.flashMessage = 'Invalid Address: ' + $routeParams.addrStr;
                } else if (e.status === 503) {
                    $rootScope.flashMessage = 'Backend Error. ' + e.data;
                } else {
                    $rootScope.flashMessage = 'Address Not Found';
                }
                $location.path('/');
            });

        };

    });