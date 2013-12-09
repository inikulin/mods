MyApp.define('Main', function(require, exports) {
    var Settings = require('Greetings.Settings'),
        printToDOM = require('Greetings.Printer.DOM'),
        printToConsole = require('Greetings.Printer.Console');

    exports.helloToDOM = function(){
        printToDOM(Settings.text, Settings.color);
    };

    exports.helloToConsole = function(){
        printToConsole(Settings.text);
    };
});