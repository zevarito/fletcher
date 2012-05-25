//
// Phantom.js script
//
//

var system = require('system')

var fs = require('fs');

var page = require('webpage').create()

var log = function (msg) {
  fs.write("/dev/stdout", msg + "\n", "a")
}

var error = function (msg) {
  fs.write("/dev/stderr", msg + "\n", "a")
}

page.onConsoleMessage = function (msg) {
  log(msg)
}

page.onError = function (msg, trace) {
  error(msg)

  trace.forEach(function(item) {
    error(item.file + ' : ' + item.line)
  })
}

page.onInitialized = function () {
  page.evaluate(function () {
    __PHANTOMJS__ = {}
  })
}

var tests = [
  "test/browser_context.html",
  "test/browser_http_context_test.html"
]

;(executeNextTest = function () {
  var test = tests.pop()

  if (test !== undefined) {
    page.open(test, function (status) {})
  } else {
    phantom.exit()
  }

  setTimeout(function () {
    executeNextTest()
  }, 2000)

})()
