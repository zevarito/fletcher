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

