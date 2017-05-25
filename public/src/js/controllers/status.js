'use strict';

angular.module('insight.status').controller('StatusController',
	function($scope, Status, Sync, getSocket) {

	var self = this;
	var socket = getSocket($scope);

	self.getStatus = function(q) {

		Status.get({
			q: 'get' + q
		},
		function(d) {

			self.loaded = 1;
			angular.extend(self, d);
		},
		function(e) {

			self.error = 'API ERROR: ' + e.data;
		});
	};

	var _onSyncUpdate = function(sync) {

		if(!sync.startTs){

			sync.startTs = Date.now();
		}

		self.sync = sync;
	};

	var _startSocket = function () {

		socket.emit('subscribe', 'sync');
		socket.on('status', function(sync) {

			_onSyncUpdate(sync);
		});
	};

	socket.on('connect', function() {

		_startSocket();
	});

	self.getSync = function() {

		_startSocket();
		Sync.get({}, function(sync) {

			_onSyncUpdate(sync);
		},
		function(e) {

			self.sync = {
				error: 'Could not get sync information' + e.toString()
			};
		});
	};
});
