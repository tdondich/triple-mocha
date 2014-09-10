var Mocha = require('mocha');

process.on('message', function(data) {
	if(data.require) {
		console.log("Attempting to require: " + data.require);
		require(data.require);
	}
	// Build mocha object
	var mocha = new Mocha({
		"reporter": "min",
		"useColors": false,
		"timeout": (data.timeout || 1000)
	});
	for (var i = data.files.length - 1; i >= 0; i--) {
		mocha.addFile(data.files[i]);
	};
	console.log("Starting tests for suite: " + (data.name || data.path));
	try {
		mocha.run(function(failures) {
				process.exit(failures);
		});
	} catch(ex) {
		console.log("Fatal exception thrown: " + ex);
		process.exit(-1);
	}
});

