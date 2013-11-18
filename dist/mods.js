/*!
 mods v0.1.0 
 Copyright (c) 2013 Ivan Nikulin (ifaaan@gmail.com, https://github.com/inikulin)
 Released under the MIT license
 */
//NOTE: declare Mods without a 'var', so it will be placed inside global object.
//Just a 'bad practice'-way to say 'window.Mods = ...'
Mods = function () {

    //Internals
    //---------------------------------------------------------------------------
    var EXPORTS_PROP = 'exports',
        FUNC_TYPE = 'function',
        FUNC_AS_EXPORTS_FLAG = '%E%',
        modules = {};


    //NOTE: error emitter. Just throw error string prefixed with 'Mods: '
    function err(msg) {
        throw 'Mods: ' + msg;
    }

    //NOTE: this is there all magic is happening, this function is a factory-method for the 'require'-functions.
    //'require' function passed to the module initializer and also used in 'get' API method.
    //'require' function used to fetch module by given 'id', initialize it if necessary,
    //and perform error checks (e.g. circular dependencies).
    function createRequireFunc(stack) {
        //NOTE: newly created function has a closure on a 'stack' parameter.
        //'stack' parameter contains call chain of the module initializers which lead to the current module
        //initialization.
        return function (id) {
            var mod = modules[id],
                circularDependencyErr,
                i = 0;

            //NOTE: we don't have module with given 'id', fail.
            if (!mod)
                err('required "' + id + '" is undefined');

            for (; i < stack.length; i++) {
                //NOTE: we have required module in call chain, so this is a circular dependency.
                //Initialize 'circularDependencyErr' variable, so now we have a circular dependency flag and error
                //message, all in one.
                if (stack[i] == id)
                    circularDependencyErr = 'circular dependency: ';

                //NOTE: if we have error, append current stack item to the error message, so we have whole call chain
                //that lead to this error.
                if (circularDependencyErr)
                    circularDependencyErr += '"' + stack[i] + '" -> ';
            }

            //NOTE: finally, if we have error append required module id to the error message, then fail
            if (circularDependencyErr)
                err(circularDependencyErr + '"' + id + '"');

            //NOTE: module is not initialized yet
            if (typeof mod == FUNC_TYPE && !mod[FUNC_AS_EXPORTS_FLAG]) {
                //NOTE: initialize 'exports' object, reuse 'mod' variable as a host for this object
                mod[EXPORTS_PROP] = {};

                //NOTE: copy stack and required module to the copy, so new require function will contain current module.
                //Initialize module with new require function and pass 'mod' as a context, so
                //'exports' object can be accessed both via 'exports' parameter and via 'this.exports'.
                mod.call(mod, createRequireFunc(stack.concat(id)), mod[EXPORTS_PROP]);

                //NOTE: save 'exports' as a module
                mod = modules[id] = mod[EXPORTS_PROP];

                //NOTE: if we have function as exports - mark it with special flag to avoid re-init
                if (typeof mod == FUNC_TYPE)
                    mod[FUNC_AS_EXPORTS_FLAG] = FUNC_AS_EXPORTS_FLAG;
            }

            return mod;
        };
    }

    //API
    //---------------------------------------------------------------------------
    return {
        define: function (id, mod) {
            //NOTE: fail if we have redefinition
            if (modules[id])
                err('"' + id + '" is already defined');

            modules[id] = mod;
        },

        //NOTE: 'get' is just require function with empty call stack
        get: createRequireFunc([])
    };
};
