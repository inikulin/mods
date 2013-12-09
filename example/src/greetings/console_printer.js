MyApp.define('Greetings.Printer.Console', function(require) {
    this.exports = function(text) {
        console.log(text);
    };
});