mods
====
![mods](https://raw.github.com/inikulin/mods/master/logo.jpg)
Nice [Asynchronous Module Definition (AMD)](https://github.com/amdjs/amdjs-api/wiki/AMD) library in just [470 bytes of minified code](https://github.com/inikulin/mods/blob/master/dist/mods.min.js).

What?
====
Nowadays building any non-trivial JavaScript application  requires a significant amount of code to be written. Historically JavaScript doesn't have any modular system, which allows you to split your code in modules, separate files and control their dependencies. Moreover big applications doesn't need to initialize all it's subsystems on start. This is there lazy loading of submodules (which is AMD actually is) comes to help. There are a lot great libraries that provide AMD functionality ([RequireJS](http://requirejs.org/) is the most notable). However, I felt constant frustration with their complexity and strange design decissions. I feel that things are not [DRY](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and my code is not narrative then I'm writing things like this in RequireJS:
```js
requirejs(['jquery', 'canvas', 'app/sub'], function   ($, canvas, sub) {
    //jQuery, canvas and the app/sub module are all loaded and can be used here now.
    
    return {
        helloWorld: function() {
          console.log('Hi there!');
        }
    };
});
```

This is how I want it to be done in my code:
```js
MyApp.define('Main', function(require, exports) {
    var $ = require('jquery'),
        canvas = require('canvas'),
        sub = require('sub');
        
    exports.helloWorld = function(){
      console.log('Hi there');
    };
});
```

Another issue with RequireJs is that modules structure mimics filesystem structure. So rebasing single file may become a
significant pain in the ass. 
The most common process of building your scripts (e.g. with [grunt](http://gruntjs.com/) is):
* Concat all JS files in the given directory
* Uglify resulting file into a single runtime

With such approach usage of the RequireJS may become [really painful](https://github.com/yeoman/grunt-usemin/issues/192).

So if you want nice, modular and narrative code, filesystem/url-agnostic AMD library with nice error handling and you want to concat all your scripts (without taking care of their order/filesystem path) into a single file then `mods` is your choise.

Usage
====
### 1. Init your app/module container
```js
var MyApp = new Mods();
```

### 2. Encapsulate used libs
```js
MyApp.define('jQuery', function() {
    this.exports = jQuery.noConflict();
});

MyApp.define('async', function() {
    this.exports = async.noConflict();
});
```

### 3. Define your modules
```js

//Use object as exports
//---------------------------------------------------------
MyApp.define('Greetings.Settings', function() {
    this.exports = {
      text: 'Hello world',
      color: 'red'
    };
});


//Use function as exports
//----------------------------------------------------------
MyApp.define('Greetings.Printer.DOM', function(require) {
    var $ = require('jQuery');
    
    this.exports = function(text, color) {
        $('<div>')
            .text(text)
            .css({color: 'red'})
            .appendTo('body');
    };
});


MyApp.define('Greetings.Printer.Console', function(require) {
    this.exports = function(text) {
        console.log(text);
    };
});


//Extend exports object (like in Node.js)
//----------------------------------------------------------
MyApp.define('Greetings', function(require, exports) {
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
```

### 4. Use your app/module container
```js
var Greetings = MyApp.get('Greetings');

Greetings.helloToDOM();
Greetings.helloToConsole();
```

By the way, it can handle issues in your code
====
###If you have a circular dependency in your code:

```js 
var MyApp = new Mods();

MyApp.define('Module1', function(require){
  var Module2 = require('Module2');
});

MyApp.define('Module2', function(){
  var Module1 = require('Module1');
});

var Module1 = MyApp.get('Module1');
``` 

You will get error from `mods` in your console:
`Mods: circular dependency: "Module1 -> Module2 -> Module1"`

###If you load module which is not defined:

```js 
var MyApp = new Mods();

MyApp.define('Main', function(require){
   var dummy = require('MyUndefinedModule');
});

//or

var dummy = MyApp.get('MyUndefinedModule'); 
``` 

You will get error from `mods` in your console:
`Mods: required "MyUndefinedModule" is undefined`

###If you redefine already defined module:

```js 
var MyApp = new Mods();

MyApp.define('Main', function(){
});

MyApp.define('Main', function(){
});
``` 

You will get error from `mods` in your console:
`Mods: "Main" is already defined`

Questions or suggestions?
====
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/mods/issues).

Author
====
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)
