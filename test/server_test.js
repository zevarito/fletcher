console.log("Starting server tests...")

gerbil = require('./vendor/gerbil/lib/gerbil')

fletcher = require('../src/fletcher')

scenario = gerbil.scenario

scenario("Fletcher", {

  "should define define global": function (g) {
    g.assert(define)
  },

  "should define fletcher global": function (g) {
    g.assert(fletcher)
  }
})

scenario("Define", {

  "should pass dependencies as arguments": function (g) {

    define("module_a", { jump: function() {} })
    define("module_b", { walk: function() {} })

    define("module_c", ["module_a", "module_b"],
      function(a, b) {
        g.assertType(Function, a.jump)
        g.assertType(Function, b.walk)
      }
    )
  },

  "should be able to define object literals": function (g) {
    define("apple", { color: "red" })
    var apple = fletcher.require('apple')
    g.assertEqual(apple.color, "red")
  },

  "should define anonymous literal modules": function (g) {
    define({})
    g.assert(true)
  },

  "should define anonymous function modules": function (g) {
    define(function () {
      g.assertType(Object, this)
    })
  },

  "should define anonymous modules with dependencies": function (g) {
    define("a", function () { return {a: "a"} })
    define("b", function () { return {b: "b"} })

    define(["a", "b"], function (a, b) {
      g.assertEqual(a, {a: "a"})
      g.assertEqual(b, {b: "b"})
    })
  }
})

scenario("Require", {

  "should return the required module": function (g) {

    var m

    define("my_module", function () {
      m = {
        doesGreatThing: function () {}
      }

      return m
    })

    var my_module = fletcher.require('my_module')

    g.assertEqual(my_module, m)
  }
})
