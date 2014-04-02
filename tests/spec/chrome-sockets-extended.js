

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
	it('open returns socket', function(done) {
		window.chrome.socketsExtended.tcp.open({}, function(socket) {
			expect(socket).not.toBe(null);
			expect(socket instanceof window.chrome.socketsExtended._classes.ChromeTcpSocket).toEqual(true);
			done();
		});
	});
	it('contains function definitions', function(done) {
		window.chrome.socketsExtended.tcp.open({}, function(socket) {
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
	});
});

describe('udp', function() {
	it('open returns socket', function(done) {
		window.chrome.socketsExtended.udp.open({}, function(socket) {
			expect(socket).not.toBe(null);
			expect(socket instanceof window.chrome.socketsExtended._classes.ChromeUdpSocket).toEqual(true);
			done();
		});
	});
	it('contains function definitions', function(done) {
		window.chrome.socketsExtended.udp.open({}, function(socket) {
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
	});
});


describe('tcpServer', function() {
	it('open returns socket', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(socket) {
			expect(socket).not.toBe(null);
			expect(socket instanceof window.chrome.socketsExtended._classes.ChromeTcpServerSocket).toEqual(true);
			done();
		});
	});
	it('contains function definitions', function(done) {
		window.chrome.socketsExtended.tcpServer.open({}, function(socket) {
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
});