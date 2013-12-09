MyApp.define('Greetings.Printer.DOM', function (require) {
    var $ = require('jQuery');

    this.exports = function (text, color) {
        $(document).ready(function () {
            $('<div>')
                .text(text)
                .css({color: 'red'})
                .appendTo('body');
        });
    };
});