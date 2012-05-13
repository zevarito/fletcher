fletcher = (function () {

  var fletcher = {

    async: false,

    mainContext: {},

    // Dependency tree object
    tree: {},
    traversing: false,

    // Function to be called once all dependencies have been loaded.
    fnComplete: null,
    fnCompleteContext: {},

    // Flag all modules loaded.
    completed: false,

    // This is an object from this composition:
    // {"module.namespace": true}
    dependencies_solved: {},

    // Set a function to be called when all dependencies are loaded.
    //
    // fn      - Function to be called
    // context - Bind `this` for that for provided `fn`
    //
    onComplete: function (fn, context) {
      this.fnComplete = fn
      this.fnCompleteContext = context
    },

    // Sets a `completed` flag to true and callback the provided
    // function if exists.
    //
    setCompleted: function () {
      if (this.fnComplete) {
        this.fnComplete.apply(this.fnCompleteContext)
        this.fnComplete = null
      }

      this.completed = true
    },

    // Defines a Module
    //
    // String  - Module name
    // *String - Module dependency name
    // Fn      - Function that "closures" your module
    //
    // Returns Nothing.
    //
    define: function() {

      // We are never finish when a module is beign defined.
      this.completed = false

      var args = Array.prototype.slice.call(arguments)

      var key = args[0],
          dependencies = args.slice(1, -1),
          body = args.slice(-1)[0]

      originalDependencies = dependencies.slice(0)
      dependencies = this.rejectSolvedDependencies(dependencies)

      // Module
      this.tree[key] = {
        key: key,
        namespace: null,
        originalDependencies: originalDependencies,
        dependencies: dependencies,
        body: body,
        loaded: false
      }

      this.defer(this.startWorker)
    },

    require: function (module_key) {
      return this.keyToNamespace(module_key, this.mainContext)
    },

    // Defers a function execution. Only if `async` flag value
    // is `true`, otherwise executes inmediatly, forcing `sync`
    // behavior.
    defer: function(fn, t) {
      if (this.async) {
        t = t || 0
        context = this
        setTimeout(function() { fn.apply(context) }, t)
      } else {
        fn.apply(this)
      }
    },

    // Do shit
    startWorker: function() {
      if(this.traversing || this.completed)
        return

      this.traversing = true;

      var worker = function () {
        this.traverse()
        this.traversing = false;
        this.defer(this.startWorker, this.nextTurn())
      }

      this.defer(worker)
    },

    // Fibonacci delay time to wait for dependencies.
    nextTurn: function() {

      var a = 0, c = 0,
          b = 1

      return function() {
        c = a + b
        a = b
        b = c
        return c * 100
      }
    }(),

    // Traverse Tree finding modules that are able to be loaded and attempt to
    // satisfice module dependencies first.
    // Our strategy is to give priority to those modules that have not
    // dependencies to be loaded. And `defering` the ones that has.
    //
    // Returns nothing.
    //
    traverse: function () {

      // Keep a count of modules remaining to be loaded.
      var remainingModulesCount = 0

      for (key in this.tree) {

        // Take the module from the tree.
        var module = this.tree[key]

        // We may end up traversing already loaded modules.
        if (module.loaded)
          continue

        console.log("Traverse: " + key)

        // If the module has dependencies to load first.
        // Else load the module.
        if (module.dependencies && module.dependencies.length > 0) {

          // TODO: Defer this function to prioritize moudules with no dep.
          //
          // Attempt to satisfy those dependencies.
          // If everything ok the module will be loaded.
          if (this.satisfy(module))
            this.loadModule(module)
          else
            remainingModulesCount++

        } else {
          this.loadModule(module)
        }
      }

      // If there is no more remainging modules call setCompleted
      // function if it exists and flag.
      if (remainingModulesCount === 0)
        this.setCompleted()
    },

    // Returns an array of namespaces for the given dependency array.
    //
    // dependencies - Array with namespace keys.
    //
    // Returns an array of namespaces.
    //
    getDepenciesNamespaces: function(dependencies) {
      var dependencies_namespaces = new Array()

      for(var i in dependencies) {
        dependencies_namespaces.push(this.keyToNamespace(dependencies[i], this.mainContext))
      }

      return dependencies_namespaces
    },

    // Loads a Module, and remove it from other modules as dependency.
    //
    // Returns Nothing.
    //
    loadModule: function (module) {

      // `Unwrap` the module in a temporary namespace.
      if (typeof module.body === "function") {

        module.namespace = module.namespace || {}

        var args = [module.namespace],
            requirements = this.getDepenciesNamespaces(module.originalDependencies)

        // Add required modules to arguments call
        for (var i in requirements) {
          args.push(requirements[i])
        }

        // Provide `Empty` context to execute module in a "safe" place.
        // Also keep trace of what the module returns.
        var ret = module.body.apply({}, args)

        // If the module returns `something` replace namespace with it.
        if (ret !== undefined) module.namespace = ret
      } else {
        module.namespace = module.body
      }

      // Has the namespace been writed in the given key?
      if (this.writeKeyNamespace(module.key, module.namespace)) {

        // Flag module as loaded.
        module.loaded = true

        // Log it.
        console.log("Loaded \"" + module.key + "\" as: " + (typeof module.body))

        // Remove as dependency for other modules
        this.removeDependency(module.key)
      }
    },

    // Reject already resolved dependencies for an array
    // of dependencies.
    // This method is used when a new module is registered in the tree.
    //
    // dependencies - Array
    //
    // Returns Array with the dependencies still to resolve.
    //
    rejectSolvedDependencies: function (dependencies) {
      var new_dependencies = []

      // Iterate over module dependencies.
      for (dep in dependencies) {

        // Iterate over dependencies_solved array to find out if
        // the dependency was already loaded.
        if (!this.dependencies_solved[dependencies[dep]])
          new_dependencies.push(dependencies[dep])
      }

      return new_dependencies
    },

    // Remove a dependency from every module dependency in the tree
    // that require this dependency key.
    //
    // dependency - String, namespace key.
    //
    // Returns Nothing
    //
    removeDependency: function (dependency) {

      // Iterate over all modules
      for (var key in this.tree) {

        // Take module and initialize a new array of dependencies.
        var module = this.tree[key],
            new_requirements = new Array()

        // Iterate over module dependencies.
        for (var dep in module.dependencies) {

          // If the dependency isn't the searched dependency add it to the
          // new dependencies array.
          if (module.dependencies[dep] != dependency)
            new_requirements.push(module.dependencies[dep])
        }

        // Write new dependencies in the module.
        module.dependencies = new_requirements
      }

      // Mark this dependency as solved.
      this.dependencies_solved[dependency] = true
    },

    // Parses a String representing a namespace and return
    // the namespace found in the given context.
    //
    // key     - String representing the namespace.
    // context - Object where the namespace should be found.
    //
    // Returns found namespace or undefined.
    //
    keyToNamespace: function(key, context) {

      var parts = key.split(".")

      try {
        parts.forEach(function(part, i) {
          context = context[part]
        })
      } catch(e) {}

      return context
    },

    // Write a namespace in the given key-namespace and context.
    //
    // key       - String representing the namespace that should be written.
    // namespace - Object/Fn that will be copied to the namespace
    // context   - Where the key should be searched.
    //
    // Returns Boolean.
    //
    writeKeyNamespace: function(key, namespace) {
      var parts = key.split("."),
          base = parts.slice(0, -1),
          name = parts.slice(-1).toString()

      var context = this.mainContext

      for (var i in base) {
        var part = base[i]

        if(!context[part])
          return false

        context = context[part]
      }

      context[name] = namespace
      return true
    },

    // Attempt to satisfy module dependencies.
    //
    // module - Module to satisfy.
    //
    satisfy: function(module) {
      var fail = false

      // Log Stuff
      var req = module.dependencies.length == 0 ? "none" : module.dependencies
      console.log("Satisfying: \"" + module.key + "\" dependencies: " + req)

      module.dependencies.forEach(function(module_key) {

        // Do we have a module defined and it is not loaded?
        if(this.tree[module_key] !== undefined) {
          if(this.tree[module_key].dependencies.length == 0 && !this.tree[module_key].loaded)
            this.loadModule(this.tree[module_key])
          else
            fail = true
        } else if(this.keyToNamespace(module_key, this.mainContext) !== undefined) {
          console.log("Found: " + module_key)
          this.removeDependency(module_key)
        } else {
          if (this.async) {
            console.log("Missing: " + module_key)
            fail = true
          } else {
            // TODO: Pretty sure this blow up with two modules, let's see...
            console.log("I'll find you: " + module_key)
            this.traverse()
          }
        }
      }, this)

      return !fail
    },

    isCommonJs: function() {
      (typeof module !== "undefined" &&
          typeof module.exports !== "undefined") ? true : false
    }
  }

  // Export globals
  // FIXME: This is little crap, also needs propertly documentation.
  this.define = function() { return fletcher.define.apply(fletcher, arguments) }
  this.require = function() { return fletcher.require.apply(fletcher, arguments) }

  var interface = {
    define: this.define,
    require: this.require
  }

  if (fletcher.isCommonJs()) {
    module.exports.define = interface.define
    module.exports.fletcher = interface
  } else {
    define = interface.define
    require = interface.require
  }

  return interface

}).call(this)
