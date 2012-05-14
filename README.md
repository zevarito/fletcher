
- [Development](#development)
- [Contributions](#contributions)
- [License](#license)
- [Authorship](#authorship)

## Defining Modules

```js
define(name, [dep1..depX], function or Object)
```

### Object Literals

```js
define("capuchino", {
  foam: "much",
  temperature: function () { /*...*/ }
});

require("capuchino") // {foam: "much", temperature: [Function]}
```

### Function wrapped

```js
define("capuchino", function (capuchino) {
  // implement capuchino, it will be the module exported.
};

define("capuchino", function () {
  // implement capuchino

  return {
    // export capuchino interface
  }
});
```

### Dependencies

```js
define("ingredients", function (ingredients) {
  ingredients.milk = function () {};
  ingredients.coffe = function () {};
});

define("capuchino", "ingredients", function (capuchino, ingredients) {
  capuchino.makeCoffe = function () {
    return ingredients.coffe() + ingredients.milk();
  }
});
```

## Development

### Dependencies

- [Node](http://nodejs.org)
- [PhantomJs](http://phantomjs.org)
- [Gerbil](http://github.com/elcuervo/gerbil) as Node package

### Run tests

Clone the repo and initialize submodules

```
$ git submodule init && git submodule update
```

Run the full suite.

```
$ npm test
```

Tests are writted using Gerbil test framework and are separated in two groups.
Browser side tests will test the Async behavior of Fletcher and Server side test
will test Fletcher Sync behavior running with Node.
PhantomJs is a dependency to run Browsers tests in a headless way, but not code is assertions is evaluated there
for now.

Run Node tests only.

```
$ node test/server_test.js
```

Run Browser tests only.

```
$ phantomjs test/browser_runner.js
```

If you want to run Browser tests outside PhantomJs just open this file in your favorite Browser.

```
./test/browser_test.js
```

### Contributions

All contributions are appreciated.

### License

This piece of software is released under MIT license.
Please refer to LICENSE file for more details.

### Authorship

[Alvaro Gil](http://github.com/zevarito)

[Cubox](http://cuboxlabs.com)
