'use strict';

angular.module('insight.address').controller('AddressController',
function($scope, $rootScope, $document, $routeParams, $location, $window, Address, getSocket, Constants, ContractsInfo, Contracts, ERC20AddressBalances) {

	var self = this;
	var socket = getSocket($scope);
	var addrStr = $routeParams.addrStr;

    var hexString = '0000000000000000000000000000000000000000000000000000000000000000';
    self.STORAGE_ROWS = Constants.STORAGE_ROWS;
    self.STORAGE_CONST = {
        STRING: 'string',
        NUMBER: 'number',
        ADDRESS: 'address',
        DATA: 'data'
    };
    self.storageViews = [ self.STORAGE_CONST.DATA, self.STORAGE_CONST.STRING, self.STORAGE_CONST.NUMBER, self.STORAGE_CONST.ADDRESS ];
    self.storage = {};
	self.info = null;
    self.scrollConfig = {
        autoHideScrollbar: false,
        theme: 'custom',
        advanced:{
            updateOnContentResize: true
        },
        scrollInertia: 0
    };
    self.tooltipOptions = {
        animation: 'fade',
        theme: 'tooltipster-black',
        trigger: 'click',
        interactive: true
    };
	self.qrColors = {
		background: Constants.QRCOLOR.background,
		color: Constants.QRCOLOR.color
	};

	self.balances = [];

	var _startSocket = function() {
		socket.on('qtumd/addresstxid', function(data) {

			if (data.address === addrStr) {

				var base = $document.find('base');
				var beep = new Audio(base[0].href + '/sound/transaction.mp3');

				$rootScope.$broadcast('tx', data.txid);
				beep.play();
			}
		});
	
		socket.emit('subscribe', 'qtumd/addresstxid', [addrStr]);
	};

    var _parseStorageRowType = function(hex, type) {

        switch (type){

            case 'string': {

                var newValue = '';
                var i = hex.substring(0, 2) === '0x' ? 2 : 0;

                for ( ; i < hex.length; i += 2) {

                    var symbol = String.fromCharCode(parseInt(hex.substr(i, 2), 16));

                    symbol = !symbol.charCodeAt() ? ' ' : symbol;
                    newValue += symbol;
                }

                return newValue;
            }
            case 'number': {
                return parseInt(hex, 16);
            }
            case 'address': {
                return hex.substr(-40);
            }
            case 'data': {
                return hexString.substr(hex.length).concat(hex);
            }
            default: {
                return hex;
            }
        }
    };

    var _defineDefaultState = function(string, number){

        var stringMatchUnread = string.match(/[^a-zA-Z0-9;:'".,\/\]\[?!&%#@)(_`><\s]/g) || [];
        var stringMatchRead = string.match(/[a-zA-Z0-9;:'".,\/\]\[?!&%#@)(_`><]/g);
        var isLastSymbolUnread = string[ string.length - 1 ] === stringMatchUnread[0];

        if(!~(number.toString().indexOf('e'))){
            return self.STORAGE_CONST.NUMBER;
        }

        if((isLastSymbolUnread || !stringMatchUnread.length) && stringMatchRead){
            return self.STORAGE_CONST.STRING;
        }

        return self.STORAGE_CONST.DATA;
    };

    var _formStorageInfo = function() {

        var rows = [];

        for(var row in self.info.storage){
            if(self.info.storage.hasOwnProperty(row)){
                for(var key in self.info.storage[ row ]){

                    var newRow = {
                        values: {},
                        keys: {}
                    };

                    if(self.info.storage[ row ].hasOwnProperty(key)){
                        for(var CONST in self.STORAGE_CONST){

                            var constName = self.STORAGE_CONST[ CONST ];

                            newRow.values[ constName ] = _parseStorageRowType(self.info.storage[ row ][ key ], constName);
                            newRow.keys[ constName ] = _parseStorageRowType(key, constName);
                        }

                        newRow.values.state = _defineDefaultState(newRow.values.string, newRow.values.number, newRow.values.address);
                        newRow.keys.state = _defineDefaultState(newRow.keys.string, newRow.keys.number, newRow.keys.address);

                        rows.push(newRow);
                    }
                }
            }
        }
        return rows;
    };

	var _stopSocket = function () {

		socket.emit('unsubscribe', 'qtumd/addresstxid', [addrStr]);
	};

	socket.on('connect', function() {

		_startSocket();
	});

	$scope.$on('$destroy', function(){

		_stopSocket();
	});

	self.params = $routeParams;

	self.findOne = function() {

		$rootScope.currentAddr = $routeParams.addrStr;

		_startSocket();


		ERC20AddressBalances.query({
            balanceAddress: $routeParams.addrStr
        }, function (balances) {
            if (balances && balances.length) {
                self.balances = balances;
            }

        });

		Address.get({
			addrStr: $routeParams.addrStr
		},
		function(address) {

			$rootScope.titleDetail = address.addrStr.substring(0, 7) + '...';
			$rootScope.flashMessage = null;

			self.address = address;

            ContractsInfo.get({
                contractAddressStr: Contracts.getEthAddressFromBitAddress($routeParams.addrStr)
            }, function (info) {
                if (info) {
                	self.info = info;
                    self.opcodesStr = Contracts.getContractOpcodesString(info.code);
                    self.storage.rows = _formStorageInfo();
                    self.storage.storageLength = Object.keys(info.storage).length;
                    self.storage.viewRows = Constants.STORAGE_ROWS;
				}
            }, function (e) {
                console.log('e', e);
            });


		},
		function(e) {

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


    self.toggleStorageRowView = function(index, stateType) {

        var currentStateNumber = self.storageViews.indexOf(self.storage.rows[ index ][ stateType ].state);

        self.storage.rows[ index ][ stateType ].state = self.storageViews[ (currentStateNumber + 1) % self.storageViews.length ];
    };

    self.showMoreStorageRows = function(limit){

        self.storage.viewRows = limit;
    };

    //TODO:: outside click

    self.tokenDropdownOpen = false;

    self.toggleDropdownTokenTracker = function() {
        self.tokenDropdownOpen = !self.tokenDropdownOpen;
    };

});
