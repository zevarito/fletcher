scenario = require('gerbil').scenario

fletcher = require('../src/fletcher')
define = fletcher.exportVariables(this).define

scenario("Fletcher", {

  "Fletcher should exist!": function (g) {
    g.assert(fletcher)
    //g.assert(module.exports.fletcher)
  }
})

scenario("Defining modules", {

  "It should pass the module as first argument": function (g) {

    define("my_module", function(my_module) {
      my_module.doesGreatThing = function() {}
    })

    var my_module = fletcher.require('my_module')

    g.assert(my_module)
    g.assert(typeof my_module.doesGreatThing === "function")
  }
})
