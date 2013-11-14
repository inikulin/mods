(function () {
    test('Deferred module loading', function () {
        var modules = new Mods();

        modules.define('module1', function (require, exports) {
            var m2 = require('module2'),
                m3 = require('module3'),
                m4 = require('module4');

            exports.val = '$m1' + m2.val + m3 + m4.val;
        });

        modules.define('module2', function (require, exports) {
            exports.val = '$m2';
        });

        modules.define('module3', function (require, exports) {
            var m2 = require('module2');

            this.exports = '$m3' + m2.val;
        });

        modules.define('module4', {
            val: '$m4'
        });

        var m1 = modules.get('module1');

        strictEqual(m1.val, '$m1$m2$m3$m2$m4');

        var m2 = modules.get('module2');

        strictEqual(m2.val, '$m2');

        var m4 = modules.get('module4');

        strictEqual(m4.val, '$m4');
    });

    test('Exported function should be processed correctly', function () {
        var modules = new Mods();

        modules.define('Func', function () {
            this.exports = function () {
                return 'test';
            };
        });

        //NOTE: first init
        modules.get('Func');

        //NOTE: get it second time - exported function shouldn't be used as a module constructor
        var func = modules.get('Func');

        strictEqual(func(), 'test');
    });

    test('Module should be loaded only once', function () {
        var modules = new Mods(),
            m1LoadCount = 0,
            m2LoadCount = 0;

        modules.define('module1', function (require, exports) {
            m1LoadCount++;
            exports.val = require('module2').val;
        });

        modules.define('module2', function (require, exports) {
            m2LoadCount++;
            exports.val = 'Yo!';
        });

        modules.get('module1');

        strictEqual(m1LoadCount, 1);
        strictEqual(m2LoadCount, 1);

        modules.get('module1');
        modules.get('module2');

        strictEqual(m1LoadCount, 1);
        strictEqual(m2LoadCount, 1);
    });


    test('Module redefinition', function () {
        expect(1);

        var modules = new Mods();

        modules.define('theAnswer', function () {
            this.exports = '42';
        });

        try {
            modules.define('theAnswer', function () {
                this.exports = null;
            });
        } catch (err) {
            strictEqual(err.message, 'Mods: "theAnswer" is already defined');
        }
    });


    test('Required module is undefined', function () {
        expect(1);

        var modules = new Mods();

        try {
            modules.get('someModule');
        } catch (err) {
            strictEqual(err.message, 'Mods: required "someModule" is undefined');
        }
    });

    test('Circular dependency', function () {
        expect(1);

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
            modules.get('module1');
        } catch (err) {
            strictEqual(err.message, 'Mods: circular dependency: "module1" -> "module2" -> "module3" -> "module1"');
        }
    });

    test('Circular dependency - conditional case', function () {
        expect(1);

        var modules = new Mods();

        modules.define('module1', function (require, exports) {
            exports.oops = function () {
                require('module2');
            };
        });

        modules.define('module2', function (require, exports) {
            require('module1');
        });

        var m1 = modules.get('module1');

        try {
            m1.oops();
        } catch (err) {
            strictEqual(err.message, 'Mods: circular dependency: "module1" -> "module2" -> "module1"');
        }
    });

}());
