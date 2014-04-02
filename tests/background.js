chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('tests.html', {
		'bounds': {
			'width': 400,
			'height': 500
		}
	});
});