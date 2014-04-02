jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

function stringToArrayBuffer(message) {
	var buffer = new ArrayBuffer(message.length);
    var view = new Uint8Array(buffer);
    for(var i = 0; i < message.length; i++) {
        view[i] = message.charCodeAt(i);
    }

    return buffer;
}

function arrayBufferToString(message) {
	return String.fromCharCode.apply(null, new Uint8Array(message));
}


describe('Namespace', function() {
	it('exists', function(done) {
		expect(window.chrome.socketsExtended).toBeDefined();
		expect(window.chrome.socketsExtended.tcp).toBeDefined();
		expect(window.chrome.socketsExtended.udp).toBeDefined();
		expect(window.chrome.socketsExtended.tcpServer).toBeDefined();
		expect(window.chrome.socketsExtended._classes).toBeDefined();
		done();
	});

	it('contains classes', function(done) {
		expect(window.chrome.socketsExtended._classes.ChromeTcpSocket).toBeDefined();
		expect(window.chrome.socketsExtended._classes.ChromeUdpSocket).toBeDefined();
		expect(window.chrome.socketsExtended._classes.ChromeTcpServerSocket).toBeDefined();
		done();
	});

	it('contains defined open functions', function(done) {
		expect(window.chrome.socketsExtended.tcp.open).toBeDefined();
		expect(window.chrome.socketsExtended.udp.open).toBeDefined();
		expect(window.chrome.socketsExtended.tcpServer.open).toBeDefined();
		done();
	});
});

describe('tcp', function() {
	var socket;
	beforeEach(function(done) {
		window.chrome.socketsExtended.tcp.open({}, function(newSocket) {
			socket = newSocket;
			done();
		});
	});

	afterEach(function(done) {
		socket.close();
		done();
	});

	it('open returns socket', function(done) {
		console.log(socket);
		expect(socket).not.toBe(null);
		expect(socket instanceof window.chrome.socketsExtended._classes.ChromeTcpSocket).toEqual(true);
		done();
	});
	it('contains function definitions', function(done) {
		expect(socket.update).toBeDefined();
		expect(socket.setPaused).toBeDefined();
		expect(socket.setKeepAlive).toBeDefined();
		expect(socket.setNoDelay).toBeDefined();
		expect(socket.connect).toBeDefined();
		expect(socket.disconnect).toBeDefined();
		expect(socket.send).toBeDefined();
		expect(socket.close).toBeDefined();
		expect(socket.getInfo).toBeDefined();

		// EventEmitter
		expect(socket.on).toBeDefined();
		expect(socket.removeListener).toBeDefined();
		expect(socket.removeAllListeners).toBeDefined();

		done();
	});
	xit('connect times out with non-open port', function(done) {
		socket.connect('127.0.0.1', 4319, function(result) {
			expect(result).toBeDefined();
			expect(result).toBeLessThan(0);
		});
	});
	xit('connect times out with unreachable ip', function(done) {
		socket.connect('192.168.2.1', 4319, function(result) {
			expect(result).toBeDefined();
			expect(result).toBeLessThan(0);
		});
	});
	it('connect/disconnect succeeds', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(serverSocket) {
			serverSocket.listen('127.0.0.1', 4320, function() {
				socket.connect('127.0.0.1', 4320, function(connectResult) {
					expect(connectResult).toBeDefined();
					expect(connectResult).toEqual(0);
					socket.disconnect(function() {
						done();
						serverSocket.close();
					});
				});
			});
		});
	});
	it('setPaused succeeds', function(done) {
		socket.setPaused(true, function() {
			socket.setPaused(false, function() {
				done();
			})
		});
	});
	it('setKeepAlive with non-connected socket returns error', function(done) {
		socket.setKeepAlive(true, 1, function(result) {
			expect(result).toBeDefined();
			expect(result).toBeLessThan(0);
			done();
		});
	});
	it('setKeepAlive succeeds', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(serverSocket) {
			serverSocket.listen('127.0.0.1', 4322, function() {
				socket.connect('127.0.0.1', 4322, function() {
					socket.setKeepAlive(true, 1, function(result) {
						expect(result).toBeDefined();
						expect(result).toEqual(0);

						socket.setKeepAlive(false, 0, function(result) {
							expect(result).toBeDefined();
							expect(result).toEqual(0);
							done();
							socket.close();
							serverSocket.close();	
						});
						
					});	
				})
			})
		});
	});
	it('setNoDelay with non-connected socket fails', function(done) {
		socket.setNoDelay(true, function(result) {
			expect(result).toBeDefined();
			expect(result).toBeLessThan(0);
			done();
		});
	});
	it('setNoDelay succeeds', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(serverSocket) {
			serverSocket.listen('127.0.0.1', 4323, function() {
				socket.connect('127.0.0.1', 4323, function() {
					socket.setNoDelay(true, function(result) {
						expect(result).toBeDefined();
						expect(result).toEqual(0);

						socket.setNoDelay(false, function(result) {
							expect(result).toBeDefined();
							expect(result).toEqual(0);
							done();
							socket.close();
							serverSocket.close();	
						});
						
					});	
				})
			})
		});
	});
	it('send succeeds', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(serverSocket) {
			serverSocket.listen('127.0.0.1', 4323, function() {
				serverSocket.on('accept', function(clientSocket) {
					clientSocket.on('receive', function(receiveInfo) {
						expect(receiveInfo).toBeDefined();
						expect(receiveInfo.data).toBeDefined();
						expect(receiveInfo.data.byteLength).toEqual(10);
						expect(arrayBufferToString(receiveInfo.data)).toEqual('1234567890');
						clientSocket.close();
						serverSocket.close();
						setTimeout(function() {
							done();
						}, 1000);
					});
					clientSocket.setPaused(false);
				});

				socket.connect('127.0.0.1', 4323, function() {
					socket.send(stringToArrayBuffer('1234567890'), function(result) {
						expect(result).toBeDefined();
						expect(result.resultCode).toBeDefined()
						expect(result.resultCode).toEqual(0);
						expect(result.bytesSent).toBeDefined();
						expect(result.bytesSent).toEqual(10);
					})
				});
			});
		});
	});
});

describe('udp', function() {
	var socket;
	beforeEach(function(done) {
		window.chrome.socketsExtended.udp.open({}, function(newSocket) {
			socket = newSocket;
			done();
		});
	});

	afterEach(function(done) {
		socket.close();
		done();
	});

	it('open returns socket', function(done) {
		expect(socket).not.toBe(null);
		expect(socket instanceof window.chrome.socketsExtended._classes.ChromeUdpSocket).toEqual(true);
		done();
	});
	it('contains function definitions', function(done) {
		expect(socket.update).toBeDefined();
		expect(socket.setPaused).toBeDefined();
		expect(socket.bind).toBeDefined();
		expect(socket.send).toBeDefined();
		expect(socket.close).toBeDefined();
		expect(socket.getInfo).toBeDefined();
		expect(socket.joinGroup).toBeDefined();
		expect(socket.leaveGroup).toBeDefined();
		expect(socket.setMulticastTimeToLive).toBeDefined();
		expect(socket.setMulticastLoopbackMode).toBeDefined();
		expect(socket.getJoinedGroups).toBeDefined();


		// EventEmitter
		expect(socket.on).toBeDefined();
		expect(socket.removeListener).toBeDefined();
		expect(socket.removeAllListeners).toBeDefined();

		done();
	});
	it('setPaused succeeds', function(done) {
		socket.setPaused(true, function() {
			socket.setPaused(false, function() {
				done();
			})
		});
	});
	it('bind to all interfaces, random port', function(done) {
		socket.bind('0.0.0.0', 0, function(result) {
			expect(result).toBeDefined();
			expect(result).toEqual(0);
			done();
		});
	});
	it('bind to all interfaces, specific port', function(done) {
		socket.bind('0.0.0.0', 4320, function(result) {
			expect(result).toBeDefined();
			expect(result).toEqual(0);
			done();
		});
	});
	it('bind to single interface, random port', function(done) {
		socket.bind('127.0.0.1', 0, function(result) {
			expect(result).toBeDefined();
			expect(result).toEqual(0);
			done();
		});
	});
	it('bind to single interface, specific port', function(done) {
		socket.bind('127.0.0.1', 4321, function(result) {
			expect(result).toBeDefined();
			expect(result).toEqual(0);
			done();
		});
	});
	it('send data succeeds', function(done) {
		window.chrome.socketsExtended.udp.open({}, function(serverSocket) {
			serverSocket.bind('127.0.0.1', 4322, function() {
				serverSocket.on('receive', function(receiveInfo) {
					expect(receiveInfo.data).toBeDefined();
					expect(receiveInfo.data.byteLength).toEqual(10);
					expect(arrayBufferToString(receiveInfo.data)).toEqual('1234567890');
					setTimeout(function() {
						serverSocket.close();
						done();
					}, 1000);
				});
				socket.bind('127.0.0.1', 0, function() {
					socket.send(stringToArrayBuffer('1234567890'), '127.0.0.1', 4322, function(result) {
						expect(result).toBeDefined();
						expect(result.resultCode).toBeDefined();
						expect(result.resultCode).toEqual(0);
						expect(result.bytesSent).toBeDefined(10);
						expect(result.bytesSent).toEqual(10);
					});
				});
			});
		})
	});
});


describe('tcpServer', function() {
	var socket;
	beforeEach(function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(newSocket) {
			socket = newSocket;
			done();
		});
	});

	afterEach(function(done) {
		socket.close();
		done();
	});

	it('open returns socket', function(done) {
		expect(socket).not.toBe(null);
		expect(socket instanceof window.chrome.socketsExtended._classes.ChromeTcpServerSocket).toEqual(true);
		done();
	});
	it('contains function definitions', function(done) {
		expect(socket.update).toBeDefined();
		expect(socket.setPaused).toBeDefined();
		expect(socket.listen).toBeDefined();
		expect(socket.disconnect).toBeDefined();
		expect(socket.close).toBeDefined();
		expect(socket.getInfo).toBeDefined();

		// EventEmitter
		expect(socket.on).toBeDefined();
		expect(socket.removeListener).toBeDefined();
		expect(socket.removeAllListeners).toBeDefined();

		done();
	});
});