scenario = require('gerbil').scenario

fletcher = require('../src/fletcher')

scenario("Fletcher", {

  "should define define global": function (g) {
    g.assert(define)
  },

  "should define fletcher global": function (g) {
    g.assert(fletcher)
  }
})

scenario("Requiring modules", {

  "It should return the defined module": function (g) {

    var m

    define("my_module", function(my_module) {
      my_module.doesGreatThing = function() {}
      m = my_module
    })

    var my_module = fletcher.require('my_module')

    g.assertEqual(my_module, m)
    g.assertEqual(typeof my_module.doesGreatThing, "function")
  }
})
