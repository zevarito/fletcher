console.log("Starting browser tests...")

scenario = Gerbil.scenario

if (typeof __PHANTOMJS__ !== "undefined")
  Gerbil.console = Gerbil.Console.pretty

//fletcher.logger.logInfo = true

scenario("Fletcher", {

  "should define define global": function (g) {
    g.assert(define)
  },

  "should define fletcher global": function (g) {
    g.assert(fletcher)
  },

  "should declare itself as an AMD module": function (g) {
    g.assertType(Object, define.amd)
  }
})

scenario("Async", {

  "should support anonymous function module definitions": function (g) {

    g.async(function () {

      define(function () {
        g.assert(this)
        g.end()
      })
    })
  },

  "should support anonymous literal module definitions": function (g) {
    define({})
    g.assert(true)
  },


  "should support anonymous module definitions with dependencies": function (g) {

    define(["a", "b"], function (m, a, b) {
      g.assertEqual(a, {a: "a"})
      g.assertEqual(b, {b: "b"})
      g.end()
    })

    g.async(function () {
      define("a", function () { return {a: "a"} })
      define("b", function () { return {b: "b"} })
    })
  },

  "should define modules with dependencies that doesn't exist yet": function (g) {

    define("module_c", ["module_a", "module_b"],
      function(c, a, b) {
        g.assertType(Function, a.jump)
        g.assertType(Function, b.walk)
        g.end()
      }
    )

    g.async(function () {
      define("module_a", function(m) { m.jump = function() {} })
      define("module_b", function(m) { m.walk = function() {} })
    })
  },

  "should wait for Underscore to be loaded": function (g) {

    define("myLib", ["_"], function (myLib, underscore) {
      g.assertEqual(underscore.isObject(myLib), true)
    })
  },

  "should wait for a whole dependency chain": function (g) {

    define("namespace/myLib", ["$", "_", "Backbone"], function (myLib, jQ, underscore, backbone) {
      var view = new backbone.View()
      g.assertEqual(view.tagName, "div")
    })
  }
})
