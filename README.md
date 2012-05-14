# **Fletcher** is a lightweight unobtrusive Javascript module loader.

It features Async behavior on browser side and Sync behavior when used on the server. It aims to have the only
requirement of being included before be used. This library is under heavy development and some API
changes such as names of current `define` and `require` functions will change to avoid any kind of conflict with other
module loaders such as [RequireJs](http://requirejs.org), so please if you use this in production enviroment know the risks.

- [Examples] (#examples)
  - [Defining Modules] (#defining-modules)
     - [Object Literals] (#object-literals)
     - [Function Wrapped] (#function-wrapped)
     - [With Dependencies] (#with-dependencies)
- [Api] (#api)
- [Development] (#development)
- [Contributions] (#contributions)
- [License] (#license)
- [Authorship] (#authorship)


## Examples

## Defining Modules

### Object Literals

Object literals are the most basic form of modules.
You just need to pass a Javascript object as second argument and thas it,
the whole object will become `public` and full available to be used.

```js
define("capuchino", {
  foam: "much",
  temperature: function () { /*...*/ }
});

require("capuchino") // {foam: "much", temperature: [Function]}
```

### Function Wrapped

There is two ways to return an `interface`, this will become the `public` access to the module.

a) Implement the first argument passed will become your module `interface` definition.

```js
define("capuchino", function (capuchino) {
  // implement capuchino, it will be the module exported.
};
```
b) Return an `object` will become your module `interface` definition.

```js
define("capuchino", function () {
  // implement capuchino

  return {
    // export capuchino interface
  }
});
```

### With Dependencies

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
## API

### define

```js
define(name, [dep1..depX], function or Object)
```

`name` is a required.

`[dep1..depX]` A comma separated list of dependencies as strings.

`function or Object` Module definition.

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

