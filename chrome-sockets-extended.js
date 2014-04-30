(function(window) {
	chrome.socketsExtended = {
		_classes: {},
		tcp: {},
		udp: {},
		tcpServer: {}
	};

	/*!
	 * EventEmitter v4.2.7 - git.io/ee
	 * Oliver Caldwell
	 * MIT license
	 * @preserve
	 */
	(function(){"use strict";function t(){}function r(t,n){for(var e=t.length;e--;)if(t[e].listener===n)return e;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var e=t.prototype,i=this,s=i.EventEmitter;e.getListeners=function(n){var r,e,t=this._getEvents();if(n instanceof RegExp){r={};for(e in t)t.hasOwnProperty(e)&&n.test(e)&&(r[e]=t[e])}else r=t[n]||(t[n]=[]);return r},e.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},e.getListenersAsObject=function(n){var e,t=this.getListeners(n);return t instanceof Array&&(e={},e[n]=t),e||t},e.addListener=function(i,e){var t,n=this.getListenersAsObject(i),s="object"==typeof e;for(t in n)n.hasOwnProperty(t)&&-1===r(n[t],e)&&n[t].push(s?e:{listener:e,once:!1});return this},e.on=n("addListener"),e.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},e.once=n("addOnceListener"),e.defineEvent=function(e){return this.getListeners(e),this},e.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},e.removeListener=function(i,s){var n,e,t=this.getListenersAsObject(i);for(e in t)t.hasOwnProperty(e)&&(n=r(t[e],s),-1!==n&&t[e].splice(n,1));return this},e.off=n("removeListener"),e.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},e.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},e.manipulateListeners=function(r,t,i){var e,n,s=r?this.removeListener:this.addListener,o=r?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(e=i.length;e--;)s.call(this,t,i[e]);else for(e in t)t.hasOwnProperty(e)&&(n=t[e])&&("function"==typeof n?s.call(this,e,n):o.call(this,e,n));return this},e.removeEvent=function(e){var t,r=typeof e,n=this._getEvents();if("string"===r)delete n[e];else if(e instanceof RegExp)for(t in n)n.hasOwnProperty(t)&&e.test(t)&&delete n[t];else delete this._events;return this},e.removeAllListeners=n("removeEvent"),e.emitEvent=function(r,o){var e,i,t,s,n=this.getListenersAsObject(r);for(t in n)if(n.hasOwnProperty(t))for(i=n[t].length;i--;)e=n[t][i],e.once===!0&&this.removeListener(r,e.listener),s=e.listener.apply(this,o||[]),s===this._getOnceReturnValue()&&this.removeListener(r,e.listener);return this},e.trigger=n("emitEvent"),e.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},e.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},e._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},e._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return i.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:this.EventEmitter=t}).call(this);


	/**
	 * Object that holds reference to open sockets, used to track down and emit events when they are globally emitted
	 * @type {Object}
	 */
	var socketList = {
		tcp: {},
		udp: {},
		tcpServer: {}
	};

	/**
	 * Create a new ChromeTcpSocket
	 * @param  {Object}   properties SocketProperties sent to the chrome.sockets.tcp.create
	 * @param  {Function} cb         Callback function(ChromeTcpSocket)
	 */
	chrome.socketsExtended.tcp.open = function(properties, cb) {
		chrome.sockets.tcp.create(properties, function(createInfo) {
			var socket = new ChromeTcpSocket(createInfo.socketId);
			socket.on('closed', onSocketClosed);
			socketList.tcp[createInfo.socketId] = socket;
			cb(socket);
		});
	};

	/**
	 * Create a new ChromeTcpServerSocket
	 * @param  {Object}   properties SocketProperties sent to the chrome.sockets.tcpServer.create
	 * @param  {Function} cb         Callback function(ChromeTcpServerSocket)
	 */
	chrome.socketsExtended.tcpServer.open = function(properties, cb) {
		chrome.sockets.tcpServer.create(properties, function(createInfo) {
			var socket = new ChromeTcpServerSocket(createInfo.socketId);
			socket.on('closed', onSocketClosed);
			socketList.tcpServer[createInfo.socketId] = socket;
			cb(socket);
		});
	};

	/**
	 * Create a new ChromeUdpSocket
	 * @param  {Object}   properties SocketProperties sent to the chrome.sockets.udpServer.create
	 * @param  {Function} cb         Callback function(ChromeUdpServerSocket)
	 */
	chrome.socketsExtended.udp.open = function(properties, cb) {
		chrome.sockets.udp.create(properties, function(createInfo) {
			var socket = new ChromeUdpSocket(createInfo.socketId);
			socket.on('closed', onSocketClosed);
			socketList.udp[createInfo.socketId] = socket;
			cb(socket);
		})
	};


	/**
	 * Closes ALL tcp sockets! Even ones not created using this wrapper.
	 * @param  {Function} cb Callback function
	 */
	chrome.socketsExtended.tcp.closeAll = function(cb) {
		chrome.sockets.tcp.getSockets(function(sockets) {
			for (var n = 0; n < sockets.length; n++) {
				chrome.sockets.tcp.close(sockets[n].socketId);
			}
			cb && cb();
		});
	};

	/**
	 * Closes ALL udp sockets! Even ones not created using this wrapper.
	 * @param  {Function} cb Callback function
	 */
	chrome.socketsExtended.udp.closeAll = function(cb) {
		chrome.sockets.udp.getSockets(function(sockets) {
			for (var n = 0; n < sockets.length; n++) {
				chrome.sockets.udp.close(sockets[n].socketId);
			}
			cb && cb();
		});
	};

	/**
	 * Closes ALL tcpSerer sockets! Even ones not created using this wrapper.
	 * @param  {Function} cb Callback function
	 */
	chrome.socketsExtended.tcpServer.closeAll = function(cb) {
		chrome.sockets.tcpServer.getSockets(function(sockets) {
			for (var n = 0; n < sockets.length; n++) {
				chrome.sockets.tcpServer.close(sockets[n].socketId);
			}
			cb && cb();
		});
	};


	/**
	 * Bound to ALL SOCKETS THAT GET CREATED - this releases all event listeners and drops references to the socket object
	 */
	var onSocketClosed = function() {
		socketList[this.type][this.socketId] = null;
		delete socketList[this.type][this.socketId];
		this.removeAllListeners();
	};


	/**
	 * onReceive handler for TCP - finds the appropriate ChromeTcpSocket objects and emit receive with the info
	 * @param  {Object} receiveInfo Data emitted from the chrome.sockets.tcp.onReceive handler
	 */
	chrome.sockets.tcp.onReceive.addListener(function(receiveInfo) {
		var socketId = receiveInfo.socketId;
		if (socketList.tcp[socketId]) {
			socketList.tcp[socketId].emit('receive', receiveInfo);
		}
	});

	/**
	 * onReceiveError handler for TCP - finds the appropriate ChromeTcpSocket objects and emit receiveError with the info
	 * @param  {Object} receiveErrorInfo Data emitted from the chrome.sockets.tcp.onReceive handler
	 */
	chrome.sockets.tcp.onReceiveError.addListener(function(receiveErrorInfo) {
		if (receiveErrorInfo && receiveErrorInfo.socketId && socketList.tcp[receiveErrorInfo.socketId]) {
			socketList.tcp[receiveErrorInfo.socketId].emit('receiveError', receiveErrorInfo.resultCode);
		}
	});


	/**
	 * onReceive handler for UDP - finds the appropriate ChromeUdpSocket objects and emit receive with the info
	 * @param  {Object} receiveInfo Data emitted from the chrome.sockets.udp.onReceive handler
	 */
	chrome.sockets.udp.onReceive.addListener(function(receiveInfo) {
		if (socketList.udp[receiveInfo.socketId]) {
			socketList.udp[receiveInfo.socketId].emit('receive', receiveInfo);
		}
	});

	/**
	 * onReceiveError handler for UDP - finds the appropriate ChromeTcpSocket objects and emit receiveError with the info
	 * @param  {Object} receiveErrorInfo Data emitted from the chrome.sockets.udp.onReceive handler
	 */
	chrome.sockets.udp.onReceiveError.addListener(function(receiveErrorInfo) {
		if (receiveErrorInfo && receiveErrorInfo.socketId && socketList.udp[receiveErrorInfo.socketId]) {
			socketList.udp[receiveErrorInfo.socketId].emit('receiveError', receiveErrorInfo.resultCode);
		}
	});


	/**
	 * onAccept handler for TCP Server sockets - finds the appropriate ChromeTcpServerSocket and emit a new ChromeTcpSocket
	 * to represent the new socket connection to a client
	 * @param  {Object} acceptInfo Server socketId and clientSocketId
	 */
	chrome.sockets.tcpServer.onAccept.addListener(function(acceptInfo) {
		if (socketList.tcpServer[acceptInfo.socketId]) {
			var socket = new ChromeTcpSocket(acceptInfo.clientSocketId);
			socket.on('closed', onSocketClosed);
			socketList.tcp[acceptInfo.clientSocketId] = socket;
			socketList.tcpServer[acceptInfo.socketId].emit('accept', socket);
		}
	});

	/**
	 * onAcceptError handler for TCP Server sockets - finds the appropriate ChromeTcpServerSocket and emit the error info
	 * @param  {Object} acceptErrorInfo Data emitted from the chrome.sockets.tcpServer.onAccept handler
	 */
	chrome.sockets.tcpServer.onAcceptError.addListener(function(acceptErrorInfo) {
		if (acceptErrorInfo && acceptErrorInfo.socketId && socketList.udp[acceptErrorInfo.socketId]) {
			socketList.tcpServer[acceptErrorInfo.socketId].emit('receiveError', acceptErrorInfo.resultCode);
		}
	});




	// BASE CLASS
	var ChromeSocket = function(type) {
		EventEmitter.call(this);
		this._api = chrome.sockets[type];
		this.type = type;
	}
	ChromeSocket.prototype = Object.create(EventEmitter.prototype);

	ChromeSocket.prototype.update = function(properties, cb) {
		this._api.update(this.socketId, properties, cb);
	};

	ChromeSocket.prototype.setPaused = function(paused, cb) {
		this._api.setPaused(this.socketId, paused, cb);
	};

	ChromeSocket.prototype.close = function(cb) {
		var self = this;
		try {
			this._api.close(this.socketId, function() {
				self.emit('closed');
			});
		} catch(e) {
			self.emit('closed');
		}
	};

	ChromeSocket.prototype.getInfo = function(cb) {
		this._api.getInfo(this.socketId, cb);
	};


	// TCP
	var ChromeTcpSocket = function(socketId) {
		ChromeSocket.call(this, 'tcp');
		this.socketId = socketId;
	};
	ChromeTcpSocket.prototype = Object.create(ChromeSocket.prototype);


	ChromeTcpSocket.prototype.setKeepAlive = function(enable, delay, cb) {
		chrome.sockets.tcp.setKeepAlive(this.socketId, enable, delay, cb);
	};

	ChromeTcpSocket.prototype.setNoDelay = function(noDelay, cb) {
		chrome.sockets.tcp.setNoDelay(this.socketId, noDelay, cb);
	};

	ChromeTcpSocket.prototype.connect = function(host, port, cb) {
		chrome.sockets.tcp.connect(this.socketId, host, port, cb);
	};

	ChromeTcpSocket.prototype.disconnect = function(cb) {
		try {
			chrome.sockets.tcp.disconnect(this.socketId, cb);
		} catch(e) {

		}
	};

	ChromeTcpSocket.prototype.send = function(arrayBuffer, cb) {
		chrome.sockets.tcp.send(this.socketId, arrayBuffer, cb);
	};


	// UDP
	var ChromeUdpSocket = function(socketId) {
		ChromeSocket.call(this, 'udp');
		this.socketId = socketId;
	};
	ChromeUdpSocket.prototype = Object.create(ChromeSocket.prototype);

	ChromeUdpSocket.prototype.bind = function(address, port, cb) {
		chrome.sockets.udp.bind(this.socketId, address, port, cb);
	};

	ChromeUdpSocket.prototype.send = function(arrayBuffer, host, port, cb) {
		chrome.sockets.udp.send(this.socketId, arrayBuffer, host, port, cb);
	};

	ChromeUdpSocket.prototype.joinGroup = function(address, cb) {
		chrome.sockets.udp.joinGroup(this.socketId, address, cb);
	};

	ChromeUdpSocket.prototype.leaveGroup = function(address, cb) {
		chrome.sockets.udp.leaveGroup(this.socketId, address, cb);
	};

	ChromeUdpSocket.prototype.setMulticastTimeToLive = function(ttl, cb) {
		chrome.sockets.udp.setMulticastTimeToLive(this.socketId, ttl, cb);
	};

	ChromeUdpSocket.prototype.setMulticastLoopbackMode = function(enabled, cb) {
		chrome.sockets.udp.setMulticastLoopbackMode(this.socketId, enabled, cb);
	};

	ChromeUdpSocket.prototype.getJoinedGroups = function(cb) {
		chrome.sockets.udp.getJoinedGroups(this.socketId, cb);
	};


	// TCP SERVER
	var ChromeTcpServerSocket = function(socketId) {
		ChromeSocket.call(this, 'tcpServer');
		this.socketId = socketId;
	};
	ChromeTcpServerSocket.prototype = Object.create(ChromeSocket.prototype);

	ChromeTcpServerSocket.prototype.listen = function(host, port, cb) {
		chrome.sockets.tcpServer.listen(this.socketId, host, port, cb);
	};

	ChromeTcpServerSocket.prototype.disconnect = function(cb) {
		try {
			chrome.sockets.tcpServer.disconnect(this.socketId, cb);
		} catch(e) {

		}
	};

	chrome.socketsExtended._classes['ChromeTcpSocket'] = ChromeTcpSocket;
	chrome.socketsExtended._classes['ChromeUdpSocket'] = ChromeUdpSocket;
	chrome.socketsExtended._classes['ChromeTcpServerSocket'] = ChromeTcpServerSocket;
})(window);