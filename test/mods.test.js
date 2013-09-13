(function () {
    test('Deferred module loading', function () {
        var modules = new Mods(),
            m1Initialized = false,
            m2Initialized = false,
            m3Initialized = false;

        modules.define('module1', function (require, exports) {
            exports.val = '$m1';
            m1Initialized = true;
        });

        modules.define('module2', function (require, exports) {
            var m3 = require('module3');

            exports.val = '$m2' + m3.val;
            m2Initialized = true;
        });

        modules.define('module3', function (require, exports) {
            exports.val = '$m3';
            m3Initialized = true;
        });

        modules.define('module4', {
            val: '$m4'
        });

        var m1 = modules.load('module1');

        strictEqual(m1.val, '$m1');
        ok(m1Initialized);
        ok(!m2Initialized);
        ok(!m3Initialized);

        var m2 = modules.load('module2');

        strictEqual(m2.val, '$m2$m3');
        ok(m2Initialized);
        ok(m3Initialized);

        var m4 = modules.load('module4');

        strictEqual(m4.val, '$m4');
    });

    test('Module should be loaded only once', function () {
        var modules = new Mods(),
            m1Loads = 0,
            m2Loads = 0;

        modules.define('module1', function (require, exports) {
            m1Loads++;
            exports.val = require('module2').val;
        });

        modules.define('module2', function (require, exports) {
            m2Loads++;
            exports.val = 'Yo!';
        });

        modules.load('module1');

        strictEqual(m1Loads, 1);
        strictEqual(m2Loads, 1);

        modules.load('module1');
        modules.load('module2');

        strictEqual(m1Loads, 1);
        strictEqual(m2Loads, 1);
    });

    test('Module redefinition', function () {
        var modules = new Mods();

        modules.define('theAnswer', function () {
            return '42';
        });

        try {
            modules.define('theAnswer', function () {
                return null;
            });
        } catch (err) {
            strictEqual(err.message, 'Mods: "theAnswer" is already defined');
        }
    });

    test('Required module is undefined', function () {
        var modules = new Mods();

        try {
            modules.load('someModule');
        } catch (err) {
            strictEqual(err.message, 'Mods: required "someModule" is undefined');
        }
    });

    test('Circular dependency', function () {
        var modules = new Mods();

        modules.define('module1', function (require) {
            require('module2');
        });

        modules.define('module2', function (require) {
            require('module3');
        });

        modules.define('module3', function (require) {
            require('module1');
        });

        try {
            modules.load('module1');
        } catch (err) {
            strictEqual(err.message, 'Mods: circular dependency: "module1" -> "module2" -> "module3" -> "module1"');
        }
    });

    test('Circular dependency - conditional case', function () {
        var modules = new Mods();

        modules.define('module1', function (require, exports) {
            exports.oops = function () {
                require('module2');
            };
        });

        modules.define('module2', function (require, exports) {
            require('module1');
        });

        var m1 = modules.load('module1');

        try {
            m1.oops();
        } catch (err) {
            strictEqual(err.message, 'Mods: circular dependency: "module1" -> "module2" -> "module1"');
        }
    });

}());
