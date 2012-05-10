gerbil = require('gerbil')

fletcher = require('../src/fletcher')

gerbil.Test.prototype.assertFunction = function(fn) {
  if(typeof fn === "undefined") {
    throw Gerbil.Error("Assertion Failed: Is not a Function");
  } else {
    this.assertions++;
  }
}

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

    define("module_a", function(m) { m.jump = function() {} })
    define("module_b", function(m) { m.walk = function() {} })

    define("module_c", "module_a", "module_b",
      function(c, a, b) {
        g.assertFunction(a.jump)
        g.assertFunction(b.walk)
      }
    )
  },

  "should not accept anonymous modules": function (g) {},

  "should be able to define object literals": function (g) {
    define("apple", { color: "red" })
    var apple = fletcher.require('apple')
    g.assertEqual(apple.color, "red")
  }
})

scenario("Require", {

  "should return the required module": function (g) {

    var m

    define("my_module", function(my_module) {
      my_module.doesGreatThing = function() {}
      m = my_module
    })

    var my_module = fletcher.require('my_module')

    g.assertEqual(my_module, m)
  }
})
