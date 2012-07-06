# WARNING: Outdated doc!

# **Fletcher** is a lightweight Javascript module loader

It features Async behavior on browser side and Sync behavior when used on the server.
It aims to have the only requirement of being included before being used, even if you are importing Javascript libraries
that doesn't conform the specs of module definition.
This library intent to be AMDjs compliant and implements most of its fatures but currently it **is not** 100% compliant.
Read more about [AMDjs](http://github.com/amdjs).

It is still a work in progress.

## Features

- It is lightweight, ~500 lines of commented code and ~3.8Kb compressed with Google closure compiler.
- Run in Browser and Server environemnts.
- Define anonymous and named modules with and without dependencies.
- Transparent requirement of JS libraries defined without following AMDjs module spec.
- Tested in Firefox, Chrome and PhantomJS.

## Roadmap

- Browser support.
- Fetch resources from HTTP (On the way)
- [AMDjs Tests] (https://github.com/amdjs/amdjs-tests) (On the way)
- Benchmarks


## Table of Contents

- [Defining Modules] (#defining-modules)
  - [Anonymous Modules] (#anonymous-modules)
  - [Named Modules] (#named-modules)
  - [Requiring External Javascript Libraries] (#requiring-external-js-libraries)
- [Api] (#api)
- [Development] (#development)
- [Contributions] (#contributions)
- [License] (#license)
- [Authorship] (#authorship)
- [History] (#history)

## Defining Modules

### Anonymous Modules

Anonymous Object literals are the most basic form of modules.
You just need to pass a Javascript object as module definition argument and that's it,
the whole object will become `public` and full available to be used.
This form **should** not have any dependencies.

```js
define({
  // Fill the object.
});
```

Anonymous module with dependencies.

```js
define(["a", "b"], function (a,b) {
  // Implement your module using `a` and `b`
});
```

Anonymous modules doesn't need to expose an interface since there is no way to require it later.

### Named Modules

Object literals.

```js
define("my_module", {
  doSomething: function () { /* ... */ }
});
```

then...

```js
require("my_module").doSomething();
```

Defining named modules with dependencies.

```js
define("my_module", ["a", "b"], function (a,b) {
  // Implement your module using `a` and `b`
  
  // Export an interface
  return { /* ... */ }
  
  // Export a function instead
  return function () { /* ... */ }
});
```

then

```js
require("my_module")
```

## Requiring External Javascript Libraries

If you want to load libraries such as [UnderscoreJS] (http://github.com/documentcloud/underscore) or
[Backbone] (http://github.com/documentcloud/backbone) which doesn't support AMD spec by default you can load them
transparenly by requiring them as a regular module.

```js
define("my_module", ["_", "Backbone"], function (underscore, backbone) {
  // Use underscore and backbone references in your module
});
```

If you want to require an specific portion of Backbone instead you can do the following.

```js
define("my_module", ["_", "Backbone.View"], function (underscore, backbone_view) {
  // backbone_view will be Backbone.View namespace
});
```

## API

### define

```js
define([name], [[dep0..depN]], function or Object)
```

`name` Optional String naming the module.

`[dep1..depX]` An Array of dependencies as strings. Global namespaces such as "_" can be required here.

`function or Object` Module definition.

### require

```js
require(String or Array, [function or Object])
```

TODO: Improve require API documentation ;)

### onComplete

A callback function used when running Async to let the user know when all defined modules has been loaded.

```js
fletcher.onComplete = function () {
  // We are set.
}
```

## Development

### Dependencies

- Test dependencies
  - [Node](http://nodejs.org)
  - [PhantomJs](http://phantomjs.org)
  - [Gerbil](http://github.com/elcuervo/gerbil)
    Loaded as git submodule.

- Build dependencies
  - [Closure Compiler](http://closure-compiler.googlecode.com/)

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
Browser side tests will test the Async behavior of Fletcher, and Server side test
will test Fletcher Sync behavior running with Node.
PhantomJs is a dependency to run Browsers tests in a headless way.

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
