'use strict';

var networks = {
    testnet: {
        name: 'testnet',
        pubkeyhash: 0x6f,
        pubkeystr: '6f',
        privatekey: 0xef
    },
    livenet: {
        name: 'livenet',
        pubkeyhash: 0x00,
        pubkeystr: '00',
        privatekey: 0x80
    }
};

var Network = function(data) {
    this.name = data.name;
    this.pubkeyhash = data.pubkeyhash;
    this.pubkeystr = data.pubkeystr;
    this.privatekey = data.privatekey;
};

angular.module('insight.networks')
    .factory('Networks',
        function(Constants) {

            var network = new Network(networks[Constants.NETWORK]);

            return {
                getCurrentNetwork: function () {
                    return network;
                }
            }
        });