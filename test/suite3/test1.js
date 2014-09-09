var expect = require('chai').expect;

describe("suite3", function() {
	it("should wait 1 second and then return", function(done) {
		setTimeout(function() {
			done();
		}, 1000);
	});
	it("should wait another 1 second and then return", function(done) {
		setTimeout(function() {
			done();
		}, 1000);
	});
	it("should wait one last second and then return", function(done) {
		setTimeout(function() {
			done();
		}, 1000);
	});
});