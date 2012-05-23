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

scenario("Security concerns", {
  "should not define modules in the root namespace": function (g) {
    g.assert(typeof a === "undefined")

    define("a", {})

    g.async(function () {
      define(["a"], function (a) {
        g.assert(typeof window.a === "undefined")
        g.end()
      })
    })
  }
})

scenario("Define modules", {
  "should load synchronously modules with no dependencies": function (g) {
    define("a", {value: 1})

    g.assertEqual(1, require("a").value)
  }
})

scenario("Define Anonymous modules", {

  "should be able to setup a callback to know when all modules have been loaded": function (g) {
    g.async(function () {
      define("a", {})
      define("my_module", ["a"], function (a) { return {a: "Hey!"} })
    })

    fletcher.onComplete(function () {
      g.assertEqual(require("my_module").a, "Hey!")
      g.end()
    })
  },

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

    define(["a", "b"], function (a, b) {
      g.assertEqual(a, {a: "a"})
      g.assertEqual(b, {b: "b"})
      g.end()
    })

    g.async(function () {
      define("a", function () { return {a: "a"} })
      define("b", function () { return {b: "b"} })
    })
  },

  "should support anonymous module definition using require": function (g) {

    require(["a", "b"], function (a,b) {
      g.assertType(Object, a)
      g.assertType(Object, b)
      g.end()
    })

    g.async(function () {
      define("a", {})
      define("b", {})
    })
  }
})

scenario("Define named modules", {

  "should define modules with dependencies that doesn't exist yet": function (g) {

    define("module_c", ["module_a", "module_b"],
      function(a, b) {
        g.assertType(Function, a.jump)
        g.assertType(Function, b.walk)
        g.end()
      }
    )

    g.async(function () {
      define("module_a", { jump: function() {} })
      define("module_b", { walk: function() {} })
    })
  },

  "should wait for Underscore to be loaded": function (g) {

    g.async(function () {
      define("myLib", ["_"], function (underscore) {
        g.assertEqual(underscore.isObject(this), true)
        g.end()
      })
    })
  },

  "should wait for a whole dependency chain": function (g) {

    g.async(function () {
      define("namespace/myLib", ["$", "_", "Backbone"], function (jQ, underscore, backbone) {
        var view = new backbone.View()
        g.assertEqual(jQ("<p>some</p>").html(), "some")
        g.assertEqual(underscore.isObject(this), true)
        g.assertEqual(view.tagName, "div")
        g.end()
      })
    })
  },

  "should accept multiple namespaces": function (g) {
    define("my_root/my_module", function () {
      return {
        something: function () { return "Hello!" }
      }
    })

    var m = require("my_root/my_module")

    g.assertEqual(m.something(), "Hello!")
  },

  "should require specific namespace of an external lib": function (g) {

    g.async( function () {
      define("my_root2/my_module", ["Backbone.View"], function (backbone_view) {
        var view = new backbone_view
        g.assertEqual(view.tagName, "div")
        g.end()
      })
    })
  }
})
