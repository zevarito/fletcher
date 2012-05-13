phantom = require('phantom')

phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.open("./test/browser_context.html", function (status) {

      if (status === "success") {
        console.log(status)
      } else {
        console.log(status)
      }

      ph.exit()
    })
  })
})
