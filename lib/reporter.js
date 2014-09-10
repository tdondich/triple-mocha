module.exports = Reporter;

function Reporter(runner) {

  var failures = 0;
  var passes = 0;

  runner.on('pass', function(test){
    process.send({
      type: 'pass',
      test: test.fullTitle()
    });
    passes = passes + 1;
  });

  runner.on('fail', function(test, err){
    process.send({
      type: 'fail',
      test: test.fullTitle(),
      err: err
    });
    failures = failures + 1;
  });

  runner.on('end', function(){
    process.send({
      type: 'end',
      passes: passes,
      failures: failures
    });
  });
}
