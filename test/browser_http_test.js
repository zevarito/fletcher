console.log("Starting browser http tests...")

scenario = Gerbil.scenario

if (typeof __PHANTOMJS__ !== "undefined")
  Gerbil.console = Gerbil.Console.pretty

fletcher.logger.logInfo = true

scenario("Fletcher HTTP", {
  "load underscore from http waiting for a namespace": function (g) {
    g.async(function () {

      define("my_module", ["vendor/underscore:_"], function (underscore) {
        g.assertEqual(underscore.isObject(this), true)
        g.end()
      })

    })
  },

  "load underscore from http without waiting for a namespace": function (g) {

    g.async(function () {

      define("my_other_module", ["vendor/underscore:_"], function (underscore) {
        g.assertEqual(underscore.isObject(this), true)
        g.end()
      })

    })
  },

  "load modules as text instead of evaluate them when extension is not js": function (g) {

    g.async(function () {

      define("my_module_with_shaders", ["vendor/vertex_shader.vs"], function (vs) {
        g.assertEqual(vs, "THIS IS A VERTEX SHADER TEXT FILE\n")
        g.end()
      })

    })
  }
})
