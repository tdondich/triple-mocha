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
		return callback(ex);
	}
}, function(err) {
	console.log("Completed");
	console.log(config.suites);

	console.log("Building tests");
	runTests(config.suites);

});

function runTests(suites) {
	var failures = [];
	async.each(suites, function(data, callback) {
		var child = require('child_process').fork('lib/runner', {
			"env": data.env || {},
			"silent": false
		});
		child.on('exit', function(code, signal) {
			if(code !== 0) {
				failures[failures.length] = code + " " + pluralize("failure", code) + " in suite: " + (data.name || data.path);
			}
			return callback();
		});
		// Send it's configuration
		child.send(data);
	}, function(err) {
		if(failures.length == 0) {
			console.log("All test suites passed successfully.");
		}
		else {
			for (var i = failures.length - 1; i >= 0; i--) {
				console.log(failures[i]);
			};
		}
		process.exit(failures.length);
	});
}
