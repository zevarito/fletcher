scenario = Gerbil.scenario
Gerbil.console = Gerbil.Console.pretty

//fletcher.logger.logInfo = true

scenario("Fletcher", {

  "should define define global": function (g) {
    g.assert(define)
  },

  "should define fletcher global": function (g) {
    g.assert(fletcher)
  }
})

scenario("Async", {

  "should define modules with dependencies that doesn't exist yet": function (g) {

    define("module_c", "module_a", "module_b",
      function(c, a, b) {
        g.assertType(Function, a.jump)
        g.assertType(Function, b.walk)
      }
    )

    define("module_a", function(m) { m.jump = function() {} })
    define("module_b", function(m) { m.walk = function() {} })
  },

  "should wait for Underscore to be loaded": function (g) {

    define("myLib", "_", function (myLib, underscore) {
      g.assertEqual(underscore.isObject(myLib), true)
    })
  },

  "should wait for a whole dependency chain": function (g) {

    define("namespace/myLib", "$", "_", "Backbone", function (myLib, jQ, underscore, backbone) {
      var view = new backbone.View()
      g.assertEqual(view.tagName, "div")
    })
  }
})
