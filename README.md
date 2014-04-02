chrome-sockets-extended
=======================

Wrapping the chrome.sockets API with some objects and events and things!

As you may know, working with chrome.sockets is a little bit of a pain if you've got more than one socket going on.
I've thrown together this library to extend some of the sockets functionality to give it more of an object-oriented feel.

Let's get started, shall we?


##Usage
###Creating a socket
The first step to using any of the chrome-sockets-extended functionality is to first open a socket:

```javascript
chrome.sockets.tcp.open({}, function(tcpSocket) {
	// The tcpSocket parameter is an object representing a TCP socket that you can do things with!
});
```

Now you have a TCP socket - pretty cool, huh? What about udp?

```javascript
chrome.sockets.udp.open({}, function(udpSocket) {
	// This socket is UDP!
});
```

Wow... that's slick - what if I want a tcpServer socket?

```javascript
chrome.sockets.tcpServer.open({}, function(tcpServerSocket) {
	// Seeing a pattern?
});
```

###Doing things with these sockets
Once you have a socket opened, you can access the appropriate chrome.sockets APIs against these objects.

```javascript
tcpSocket.connect('127.0.0.1', 1234, function(result) {
	if (result < 0) {
		// ERROR
	} else {
		// SUCCESS
	}
});
```

```javascript
tcpServerSocket.listen('127.0.0.1', 1234, function(result) {
	if (result < 0) {
		// ERROR LISTENING
	} else {
		// SUCCESS
	}
});
```

###Events
####receive
TCP and UDP sockets will emit a 'receive' event when data is received.
```javascript
socket.on('receive', function(receiveData) {
	var stringData = String.fromCharCode.apply(null, new Uint8Array(receiveData.data));
	console.log('The socket just received this data!', receiveData);
});
```

####receiveError

####accept
TCP server sockets will emit an 'accept' event when a new client connects, this event contains a new tcp socket for that client
```javascript

// Bind to the accept event!
serverSocket.on('accept', function(clientSocket) {

	// Unpause the socket (because the chrome.sockets API starts these off as paused...)
	clientSocket.setPaused(false, function() {

		// Message to send to client in a string
		var message = 'The price is wrong, Bob!';

		// Convert that to an ArrayBuffer
		var buffer = new ArrayBuffer(message.length);
		var view = new Uint8Array(buffer);
		for(var i = 0; i < message.length; i++) {
			view[i] = message.charCodeAt(i);
		}

		// Send it!
		clientSocket.send(buffer, function() {

			// Close it!
			clientSocket.close();
		});
	});
});
```

####acceptError

###More Examples
####TCP echo example
```javascript
// Create server socket
chrome.sockets.tcpServer.open({}, function(serverSocket) {
	
	// Listen on port 4321 on localhost
	serverSocket.listen('127.0.0.1', 4321, function(result) {

		// Setup the accept
		serverSocket.on('accept', function(clientSocket) {

			// Bind the receive event
			clientSocket.on('receive', function(receiveData) {

				// This is the stuff we're going to send back to them!
				var arrayBuffer = receiveData.data;

				clientSocket.send(arrayBuffer, function() {
					clientSocket.close();
				});

			});

			// Unpause the socket
			clientSocket.setPaused(false);
		});

	});

});
```