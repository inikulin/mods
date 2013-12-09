//NOTE: declare Mods without a 'var', so it will be placed inside a global object.
//Just a 'bad practice'-way to say 'window.Mods = ...'
Mods = function () {

    //Internals
    //---------------------------------------------------------------------------
    var EXPORTS_PROP = 'exports',
        FUNC_TYPE = 'function',
        FUNC_AS_EXPORTS_FLAG = '%E%',
        modules = {};


    //NOTE: error emitter, which just throws error string prefixed with 'Mods: '
    function err(msg) {
        throw 'Mods: ' + msg;
    }

    //NOTE: here all magic is happening, this function is a factory-method for the 'require'-functions.
    //'require' function is passed to the module initializer and also used in 'get' API method.
    //'require' function is used to fetch module by given 'id', initialize it if necessary,
    //and perform error checks (e.g. circular dependencies).
    function createRequireFunc(stack) {
        //NOTE: the newly created function has a closure on a 'stack' parameter.
        //'stack' parameter contains call chain of the module initializers, which lead to the current module
        //initialization.
        return function (id) {
            var mod = modules[id],
                circularDependencyErr,
                i = 0;

            //NOTE: we don't have a module with the given 'id', fail.
            if (!mod)
                err('required "' + id + '" is undefined');

            for (; i < stack.length; i++) {
                //NOTE: we have the required module in the call chain, so this is a circular dependency.
                //Initialize 'circularDependencyErr' variable, so now we have a circular dependency flag and error
                //message, all in one.
                if (stack[i] == id)
                    circularDependencyErr = 'circular dependency: ';

                //NOTE: if we have an error, append current stack item to the error message, so we have whole call chain
                //that leads to this error.
                if (circularDependencyErr)
                    circularDependencyErr += '"' + stack[i] + '" -> ';
            }

            //NOTE: finally, if we have an error, append required module 'id' to the error message, then fail
            if (circularDependencyErr)
                err(circularDependencyErr + '"' + id + '"');

            //NOTE: module is not initialized yet
            if (typeof mod == FUNC_TYPE && !mod[FUNC_AS_EXPORTS_FLAG]) {
                //NOTE: initialize an 'exports' object, reuse 'mod' variable as a host for this object
                mod[EXPORTS_PROP] = {};

                //NOTE: create a stack copy, append it with required module 'id', and then pass it to the
                //'createRequireFunc'. So a new 'require'-function will contain the current module in the call stack.
                //Initialize module with the new 'require'-function and pass 'mod' as a context, so the
                //'exports' object can be accessed either via an 'exports' parameter or via a 'this.exports' parameter.
                mod.call(mod, createRequireFunc(stack.concat(id)), mod[EXPORTS_PROP]);

                //NOTE: save 'exports' as a module
                mod = modules[id] = mod[EXPORTS_PROP];

                //NOTE: if we have function as exports - mark it with a special flag to avoid re-init
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
