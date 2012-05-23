(function () {

  // Convenient functions
  var isFunction = function (fn) {
    return (typeof fn === "function")
  }

  var isArray = function (arr) {
    return Object.prototype.toString.apply(arr) === '[object Array]'
  }

  var isObject = function (obj) {
    return (typeof obj === "object" && !isArray(obj))
  }

  var isFunctionOrObject = function(obj) {
    return isObject(obj) || isFunction(obj)
  }

  var isString = function (str) {
    return (typeof str === "string")
  }

  // Logger support
  var logger = {
    logInfo: false,

    info: function (msg) {
      if (this.logInfo) console.log(msg)
    }
  }

  // Implementation
  var fletcher = {

    // Indicates if we will be using Fletcher in Async or Sync way.
    // Running in the Browser the behavior will be Async.
    // Running in server with NodeJs the behavior will be Sync.
    async: !(typeof module !== 'undefined' && module.exports),

    mainContext: null,

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
    dependenciesSolved: {},

    // Keep a count of anonymous defined modules.
    anonymousModulesCount: 0,

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

    // Defines a Module.
    //
    // Examples:
    //
    //  define({})
    //
    //  define(function () {})
    //
    //  define(["dep1", "dep2"], function (dep1, dep2) {})
    //
    //  define("name", {})
    //
    //  define("name", function () {})
    //
    //  define("name", ["dep1", "dep2"], function (dep1, dep2) {})
    //
    // Returns Nothing.
    //
    define: function() {

      // We are never finish when a module is beign defined.
      this.completed = false

      var args = Array.prototype.slice.call(arguments)

      var key = args[0],
          dependencies = args[1] || [],
          body = args[2]

      // It is an anonymous module with no dependencies?
      if (!isString(key) && isFunctionOrObject(key)) {
        body = key
        key = "anonymous" + this.anonymousModulesCount++

      // It is an anonymous with dependencies?
      } else if(!isString(key) && isArray(key)) {
        body = dependencies
        dependencies = key
        key = "anonymous" + this.anonymousModulesCount++

      // It is a named module?
      } else if (isString(key)) {

        // It hasn't dependencies?
        if (!isArray(dependencies)) {
          body = dependencies
          dependencies = []
        }
      }

      // Keep a copy of original module dependencies.
      var originalDependencies = dependencies.slice(0)

      // The module will not depend anymore on resolved dependencies.
      dependencies = this.rejectSolvedDependencies(dependencies)

      // Module
      var module = this.getModuleByKey(key) || {}

      module.key = key
      module.namespace = null
      module.originalDependencies = originalDependencies
      module.dependencies = dependencies
      module.body = body
      module.loaded = false

      this.tree[key]= module

      // Create module definitions for dependencies in the module beign defined.
      this.insertDependenciesOnTree(dependencies)

      // If module has no dependencies it can be loaded synchronously.
      if (dependencies.length === 0)
        this.loadModule(this.getModuleByKey(key))
      else
        this.defer(this.startWorker)
    },

    // Create module definitions in the tree for each dependency.
    //
    // dependenciesArray - Array of module definition dependencies.
    //
    // Returns nothing.
    insertDependenciesOnTree: function (dependenciesArray) {

      for (var i in dependenciesArray) {
        // Determine module key and namespace to wait for if it isn't a standard
        // module definition.
        var keySplit = dependenciesArray[i].split(":"),
            moduleKey = keySplit[0],
            waitForNamespace = keySplit[1],
            module = this.getModuleByKey(moduleKey) || {loaded: false, key: moduleKey}

        if (waitForNamespace)
          module.waitForNamespace = waitForNamespace

        this.setModuleByKey(moduleKey, module)
      }
    },

    // Load a module based on his key string.
    //
    // moduleKey - String representing the module to be loaded.
    //
    // Returns module if was found and not used in the define form.
    require: function (moduleKey) {
      // Is `require` used in the form of `define` anonymous modules?
      if (isArray(moduleKey)) {
        this.define.apply(this, arguments)

      // If we have that module loaded and cached.
      } else if (this.getModuleByKey(moduleKey) && this.getModuleByKey(moduleKey).loaded) {
        return this.getModuleByKey(moduleKey).namespace

      } else {
        return this.keyToNamespace(moduleKey)
      }
    },

    // Defers a function execution. Only if `async` flag value
    // is `true`, otherwise executes inmediatly, forcing `sync`
    // behavior.
    defer: function(fn, t) {
      if (this.async) {
        t = t || 0
        var context = this
        setTimeout(function() { fn.apply(context) }, t)
      } else {
        fn.apply(this)
      }
    },

    // Do shit
    startWorker: function() {
      if(this.traversing || this.completed)
        return

      this.traversing = true

      var worker = function () {
        this.traverse()
        this.traversing = false
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
        var module = this.getModuleByKey(key)

        // We may end up traversing already loaded modules.
        if (module.loaded)
          continue

        logger.info("Traverse: " + key)

        // If the module has dependencies to load first.
        // Else load the module.
        if (module.dependencies && module.dependencies.length > 0) {

          // Attempt to satisfy those dependencies.
          // If everything ok the module will be loaded.
          if (this.satisfy(module)) {
            this.loadModule(module)
          } else {
            remainingModulesCount++
          }

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
    getDependenciesNamespaces: function(dependencies) {
      var dependenciesNamespaces = new Array()

      for(var i in dependencies) {
        dependenciesNamespaces.push(this.keyToNamespace(dependencies[i]))
      }

      return dependenciesNamespaces
    },

    // Loads a Module, and remove it from other modules as dependency.
    //
    // Returns Boolean.
    //
    loadModule: function (module) {

      var ret, loadedAs

      // Is the module defined by a `function` ?
      if (typeof module.body === "function") {

        // `Unwrap` the module in a temporary namespace.
        module.namespace = module.namespace || {}

        var requirements = this.getDependenciesNamespaces(module.originalDependencies)

        // Provide `Empty` context to execute module in a "safe" place.
        // Also keep trace of what the module returns.
        ret = module.body.apply({}, requirements)

        // If the module returns `something` replace namespace with it.
        if (ret !== undefined) module.namespace = ret

        loadedAs = "as Function"

      // Is the module defined by an `object`
      } else if (typeof module.body === "object") {
        module.namespace = module.body

        loadedAs = "as Object"

      // Is it defined in the `local` namespace?
      } else if (ret = this.keyToNamespaceByContext(module.key, this.mainContext)) {
        module.namespace = ret

        loadedAs = "from Main namespace"

      // Is it defined in the `global` namespace?
      } else if (ret = this.keyToNamespaceByContext(module.key, this.rootContext)) {
        module.namespace = ret

        loadedAs = "from Root namespace"

      } else {
        return false
      }

      // Has the namespace been writed in the given key?
      if (this.writeKeyNamespace(module.key, module.namespace)) {

        // Flag module as loaded.
        module.loaded = true

        // Log it.
        logger.info("Loaded \"" + module.key + "\": " + loadedAs)

        // Remove as dependency for other modules
        this.removeDependency(module.key)

        return true

      } else {
        return false
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
      var newDependencies = []

      // Iterate over module dependencies.
      for (var dep in dependencies) {

        // Iterate over dependenciesSolved array to find out if
        // the dependency was already loaded.
        if (!this.dependenciesSolved[dependencies[dep]])
          newDependencies.push(dependencies[dep])
      }

      return newDependencies
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
        var module = this.getModuleByKey(key),
            newRequirements = new Array()

        // Iterate over module dependencies.
        for (var dep in module.dependencies) {

          // If the dependency isn't the searched dependency add it to the
          // new dependencies array.
          if (module.dependencies[dep] != dependency)
            newRequirements.push(module.dependencies[dep])
        }

        // Write new dependencies in the module.
        module.dependencies = newRequirements
      }

      // Mark this dependency as solved.
      this.dependenciesSolved[dependency] = true
    },

    // Convinient function to find a `key` in root and main namespaces.
    //
    // key - String representing the namespace.
    //
    // Returns found namespace or undefined.
    //
    keyToNamespace: function (key) {
      var ns

      if (ns = this.keyToNamespaceByContext(key, this.rootContext))
        return ns
      else if (ns = this.keyToNamespaceByContext(key, this.mainContext))
        return ns
      else
        return undefined
    },

    // Parses a String representing a namespace and return
    // the namespace found in the given context.
    //
    // key     - String representing the namespace.
    // context - Object where the namespace should be found.
    //
    // Returns found namespace or undefined.
    //
    keyToNamespaceByContext: function(key, context) {

      // Is `require` *special* variable required as dependency?
      // We will not search for `require` as a namespace, we will return
      // our require function directly. This is done like this because require
      // *may not* be exported as global in certain environments.
      if (key === "require")
        return this.require

      // Support . and / notation
      var parts
      if (key.match("."))
        parts = key.split(".")
      else if (key.match("/"))
        parts = key.split("/")

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
    writeKeyNamespace: function(key, namespace, context) {
      var parts = key.split("/"),
          base = parts.slice(0, -1),
          name = parts.slice(-1).toString()

      var context = context || this.mainContext

      for (var i in base) {
        var part = base[i]

        if(!context[part])
          context[part] = {}

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
      logger.info("Satisfying: \"" + module.key + "\" dependencies: " + req)

      // Iterate over module dependencies
      module.dependencies.forEach(function(moduleKey) {

        // Get module dependency from Tree
        var moduleInTree = this.getModuleByKey(moduleKey)

        // Is that module dependency ready to be loaded? Attempt to load it then.
        if (moduleInTree.dependencies.length === 0) {

          if (this.loadModule(moduleInTree)) {
            return // Skip to next iteration.

          // If we couldn't load and we are running Async declare the
          // dependency as missing.
          } else if (!this.loadModule(moduleInTree) && this.async) {
            logger.info("Missing: " + moduleKey)

          // If we couldn't load and we are running Sync on the server
          // attempt to load the module before continue.
          } else if (!this.loadModule(moduleInTree) && !this.async) {
            logger.info("I'll find you: " + moduleKey)
            this.traverse()
            return // Skip to next iteration.
          }
        }

        fail = true
      }, this)

      return !fail
    },

    // Fetch a module definition from definition module tree.
    //
    // moduleKey - String representing the module key.
    //
    // Returns a module definition.
    getModuleByKey: function (moduleKey) {
      return this.tree[moduleKey]
    },

    // Sets a module definition in the tree.
    //
    // moduleKey - String representing the module key.
    // module    - Object module definition.
    //
    // Returns the module definition.
    setModuleByKey: function (moduleKey, module) {
      this.tree[moduleKey] = module
      return this.getModuleByKey(moduleKey)
    }
  }

  // Keep a reference to the root context.
  fletcher.rootContext = this
  // Create a base namespace where modules will be loaded.
  fletcher.mainContext = {}

  // Define fletcher interface.
  var _interface = {
    define: function() { return fletcher.define.apply(fletcher, arguments) },
    require: function() { return fletcher.require.apply(fletcher, arguments) },
    onComplete: function() { return fletcher.onComplete.apply(fletcher, arguments) },
    tree: fletcher.tree,
    logger: logger,
    mainContext: fletcher.mainContext
  }

  // Declare itself as an AMD loader.
  _interface.define["amd"] = {}

  // Define a global for module definition.
  define = _interface.define

  // If running in Node in Sync mode export the interface.
  if (!fletcher.async) {
    module.exports = _interface
  } else {
    // If running in the browser define globals `require` and `fletcher`.
    this["fletcher"] = _interface
    this["require"] = _interface.require
  }

}).call(this)
