//
// Phantom.js script
//
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

page.open("./test/browser_context.html", function (status) {
  log("Open Status: " + status + "\n")
})
