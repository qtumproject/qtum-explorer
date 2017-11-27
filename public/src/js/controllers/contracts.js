'use strict';

angular.module('insight.contracts').controller('ContractsController',
function($scope, $rootScope, $routeParams, $location, Contracts) {

    try {
        var addrStr = Contracts.getBitAddressFromContractAddress($routeParams.contractAddressStr);
        $location.path('/address/' + addrStr);
        return false;
    }
    catch (e) {

        $rootScope.flashMessage = 'Invalid Address: ' + $routeParams.contractAddressStr;
        $location.path('/');

        return false;
    }


});