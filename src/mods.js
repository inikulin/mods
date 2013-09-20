this.Mods = function () {
    var modules = {};

    function err(msg) {
        throw Error('Mods' + ': ' + msg);
    }

    function createRequireFunc(modules, stack) {
        return function (id) {
            var mod = modules[id];

            if (!mod)
                err('required "' + id + '" is undefined');

            var errMsg = '',
                hasCircularDependencies = false;

            for (var i = 0; i < stack.length; i++) {
                hasCircularDependencies = hasCircularDependencies || stack[i] === id;

                if (hasCircularDependencies)
                    errMsg += '"' + stack[i] + '" -> ';
            }

            if (hasCircularDependencies)
                err('circular dependency: ' + errMsg + '"' + id + '"');

            stack.push(id);

            if (typeof mod === 'function') {
                var exports = {'.': 1};

                mod(createRequireFunc(modules, stack), exports);

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
            return createRequireFunc(modules, [])(id);
        }
    };
};
