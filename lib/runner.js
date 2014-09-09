var Mocha = require('mocha');

process.on('message', function(data) {
	console.log("Received config object:");
	if(data.require) {
		require(data.require);
	}
	// Build mocha object
	var mocha = new Mocha({
		//"reporter": "json",
		"timeout": data.timeout || 1000
	});
	for (var i = data.files.length - 1; i >= 0; i--) {
		console.log("Adding file: " + data.files[i]);
		mocha.addFile(data.files[i]);
	};
	console.log("Starting tests...");
	try {
		mocha.run(function(failures) {
				process.exit(failures);
		});
	} catch(ex) {
		console.log("CRAP CRAP CRAP: " + ex);
	}
});

