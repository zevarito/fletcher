console.log("Starting browser http tests...")

scenario = Gerbil.scenario

if (typeof __PHANTOMJS__ !== "undefined")
  Gerbil.console = Gerbil.Console.pretty

fletcher.logger.logInfo = true

scenario("Fletcher HTTP", {
  "a": function (g) {
    g.async(function () {

      define("my_module", ["vendor/underscore:_"], function (underscore) {
        g.assertEqual(underscore.isObject(this), true)
        g.end()
      })

    })
  }
})
