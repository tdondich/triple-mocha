var expect = require('chai').expect;

describe("suite1", function() {
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
	it("should verify message", function(done) {
		expect(process.env.message).to.equal("Inside suite1");
		done();
	});
});