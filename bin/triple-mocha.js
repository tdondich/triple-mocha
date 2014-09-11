#!/usr/bin/env node
var cluster = require('cluster');
var recursive = require('recursive-readdir');
var argv = require('optimist').argv;
var path = require('path');
var utils = require('mocha/lib/utils');
var fs = require('fs');
var async = require('async');
var Mocha = require('mocha');
var pluralize = require('pluralize');
var moment = require('moment');

// Load moment duration format plugin
require("moment-duration-format");

var configFile = argv.config;
if(configFile.indexOf(path.sep) !== 0) {
	configFile = path.normalize(process.cwd() + path.sep + argv.config);
}

try {
var config = JSON.parse(
	fs.readFileSync(configFile)
);
} catch(ex) {
	console.log("There was a problem reading the config file at: " + configFile + ": " + ex.message);
	process.exit(-1);
}

async.each(config.suites, function(data, callback) {
	try {
		data.files = utils.files(data.path);
		for (var i = data.files.length - 1; i >= 0; i--) {
			data.files[i] = path.normalize(process.cwd() + path.sep + data.files[i]);
		};
		// Resolve require if it exists
		if(data.require !== undefined) {
			if(data.require.indexOf(path.sep) !== 0) {
				data.require = path.normalize(process.cwd() + path.sep + data.require);
			}
		}
		return callback();
	} catch(ex) {
		console.log("Fatal Error: " + ex);
		process.exit(-1);
		return callback(ex);
	}
}, function(err) {
	runTests(config.suites);

});

function runTests(suites) {
	var failures = null;
	var totalPasses = 0;
	var totalFailures = 0;
	async.each(suites, function(data, callback) {
		var suite = (data.name || data.path);
		var start = new moment();
		var child = require('child_process').fork(path.normalize(__dirname + "/../lib/runner"), {
			"env": data.env || {},
			"silent": true
		});
		child.on('message', function(message) {
			if(message.type == 'start') {
				console.log("Suite " + suite + " starting...");
			}
			if(message.type == 'fail') {
				if(failures == null) {
					failures = [];
				}
				if(failures[suite] == undefined) {
					failures[suite] = [];
				}
				failures[suite][failures[suite].length] = {
					test: message.test,
					err: message.err
				};
				totalFailures = totalFailures + 1;
			}
			else if(message.type == 'pass') {
				totalPasses = totalPasses + 1;
			}
			else if(message.type == 'end') {
				var end = new moment();
				var duration = moment.duration(end.valueOf() - start.valueOf()).format("D [days], H [hours] m [minutes] s [seconds] S [ms]");
				console.log("Suite: " + suite + " completed with " + message.passes + " " + pluralize("pass", message.passes) + " and " + message.failures + " " + pluralize("failure", message.failures) + " in " + duration);
			}
		});
		child.on('exit', function(code, signal) {
			// Truly only call the callback if we are indeed done.
			return callback();
		});
		// Send it's configuration
		child.send(data);
	}, function(err) {
		console.log("All suites completed with " + totalPasses + " " + pluralize("pass", totalPasses) + " and " + totalFailures + " " + pluralize("failure", totalFailures));
		if(failures !== null) {
			console.log("\nFailures: ");
			for(suite in failures) {
				console.log(suite);
				for (var i = failures[suite].length - 1; i >= 0; i--) {
					console.log((i + 1) + ") " + failures[suite][i].test);
					console.log(failures[suite][i].err.stack + "\n");
				};
			}
		}
		process.exit(totalFailures);
	});
}
