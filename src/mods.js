(function (undefined) {
    var MODS = 'Mods';

    function err(msg) {
        throw Error(MODS + ': ' + msg);
    }

    function quote(text) {
        return '"' + text + '"';
    }

    function hasProps(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return true;
        }
    }

    var createRequireFunc = function (modules, stack) {
        return function (id) {
            var mod = modules[id];

            if (!mod)
                err('required ' + quote(id) + ' is undefined');

            var errMsg = '',
                hasCircularDependencies = false;

            for (var i = 0; i < stack.length; i++) {
                hasCircularDependencies = hasCircularDependencies || stack[i] === id;

                if (hasCircularDependencies)
                    hasCircularDependencies && (errMsg += quote(stack[i]) + ' -> ');
            }

            if (hasCircularDependencies)
                err('circular dependency: ' + errMsg + quote(id));

            stack.push(id);

            if (typeof mod === 'function') {
                var exports = {};

                mod(createRequireFunc(modules, stack), exports);

                if (!hasProps(exports))
                    err(quote(id) + ' has no exports ("exports = ..." used?) ');

                mod = modules[id] = exports;
            }

            return mod;
        };
    };

    window[MODS] = function () {
        var modules = {};

        return {
            define: function (id, mod) {
                if (modules[id])
                    err(quote(id) + ' is already defined');

                modules[id] = mod;
            },

            load: function (id) {
                return createRequireFunc(modules, [])(id);
            }
        };
    };
})();
