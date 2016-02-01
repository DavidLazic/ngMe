(function (window) {
    'use strict';

    var MODULES = {};

    function ngMe () {
        this.params = {};
    };

    ngMe.prototype.someFn = function (msg) {
        console.log(msg);
        return this;
    };

    ngMe.prototype.run = function (cb) {
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof cb === 'function') return cb();
        });
    };

    ngMe.prototype.define = function (name, deps) {
        if (this.isString(name) && this.isArray(deps)) {
            var data = Array.prototype.slice(deps);
            if (data.length) {
                for (var i = data.length; i--;) {
                    if (!MODULES[data[i]]) {
                        console.error('Non-existent dependency \'' + data[i] + '\' in module \'' + name + '\'');
                        return;
                    }
                }
            }

            function ModuleConstructor (deps) {
                this.deps = deps;
            }

            ModuleConstructor.prototype.module = function (Scope) {
                function Module (scope) {
                    this.scope = scope;
                };

                Module.prototype.$inject = function () {

                };

                Module.prototype.get = function () {
                    this.someFn('calling from here');
                    console.log('get fn');
                };

                return new Module(new Scope());
            };

            MODULES[name] = new ModuleConstructor(Array.prototype.slice(deps));
        }

        return MODULES[name] || {};
    };

    ngMe.prototype.isArray = function (param) {
        return Object.prototype.toString.call(param) === '[object Array]';
    };

    ngMe.prototype.isString = function (param) {
        return typeof param === 'string';
    };

    window.ngMe = new ngMe();
})(window);

ngMe.run(function () {
    var newModule = ngMe.define('newModule', []);

    console.log(newModule);
    var a = newModule.module(function () {
        this.scopeFn = function () {
            console.log('new module scope fn.');
        };
    });
    console.log(a);
});
