var Mocha = require('mocha');

process.on('message', function(data) {
	if(data.require) {
		require(data.require);
	}
	// Build mocha object
	var mocha = new Mocha({
		"reporter": "triple-mocha/lib/reporter",
		"useColors": false,
		"timeout": (data.timeout || 1000)
	});
	for (var i = data.files.length - 1; i >= 0; i--) {
		mocha.addFile(data.files[i]);
	};
	process.send({
		type: 'start'
	})
	try {
		mocha.run(function(failures) {
				process.exit(failures);
		});
	} catch(ex) {
		console.log("Fatal exception thrown: " + ex);
		process.exit(-1);
	}
});

