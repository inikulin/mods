/*
 mods v0.1.0 
 Copyright (c) 2013 Ivan Nikulin (ifaaan@gmail.com, https://github.com/inikulin)
 Released under the MIT license
 */
Mods = function () {
    var modules = {};

    function err(msg) {
        throw Error('Mods' + ': ' + msg);
    }

    function createRequireFunc(stack) {
        return function (id) {
            var mod = modules[id],
                exports = {'.': 1},
                circularDependencyErr,
                i = 0;

            if (!mod)
                err('required "' + id + '" is undefined');

            for (; i < stack.length; i++) {
                if (stack[i] == id)
                    circularDependencyErr = 'circular dependency: ';

                if (circularDependencyErr)
                    circularDependencyErr += '"' + stack[i] + '" -> ';
            }

            if (circularDependencyErr)
                err(circularDependencyErr + '"' + id + '"');

            stack[i] = id;

            if (typeof mod == 'function') {
                mod(createRequireFunc(stack), exports);

                if (!exports['.'])
                    err('"' + id + '": "exports = ..." assignment used) ');

                mod = modules[id] = exports;
            }

            return mod;
        };
    }

    return {
        define: function (id, mod) {
            if (modules[id])
                err('"' + id + '" is already defined');

            modules[id] = mod;
        },

        get: function (id) {
            return createRequireFunc([])(id);
        }
    };
};
