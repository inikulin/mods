var MyApp = new Mods();

MyApp.define('jQuery', function() {
    this.exports = jQuery.noConflict();
});
