;(function (window) {
    'use strict';

    function ngMe (params) {
        this.params = params || {};
        this.modules = {};
    };

    ngMe.prototype.run = function (cb) {
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof cb === 'function') return cb();
        });
    };

    ngMe.prototype.define = function (moduleName, deps) {
        var __super = this;

        if (this.isString(moduleName) && this.isArray(deps)) {

            function ModuleConstructor (deps) {
                this.requires = deps;
            }

            ModuleConstructor.prototype.controller = function (vm, scope) {
                var _this = this;

                function Module (moduleName, vm, scope) {
                    this.name = moduleName;
                    this[vm] = scope;
                    this.requires = _this.requires;
                };

                Module.prototype.$$scope = function () {
                    var _this = this;
                    var _arguments = Array.prototype.slice.call(arguments);
                    _arguments.forEach(function (arg) {
                        _this[vm].call(_this[vm], __super.modules[arg]);
                    });

                    return _this;
                }

                __super.modules[moduleName] = scope;

                return (function () {
                    return (new Module(moduleName, vm, scope)).$$scope(deps);
                })();
            };

            return new ModuleConstructor(Array.prototype.slice.call(deps));
        }

        return {};
    };

    ngMe.prototype.isArray = function (param) {
        return Object.prototype.toString.call(param) === '[object Array]';
    };

    ngMe.prototype.isString = function (param) {
        return typeof param === 'string';
    };

    window.ngMe = new ngMe();
})(window);

;(function () {
    'use strict';

    ngMe.run(function () {
        var aModule = ngMe.define('a', []);

        aModule.controller('aModuleController', aModuleController);
        function aModuleController () {
            var vm = this;

            vm.fnA = fnA;

            function fnA () {
                console.log('fnA called from bModule');
            };
        }

        setTimeout(function () {
            var bModule = ngMe.define('bModule', ['a'])
                .controller('bModuleController', bModuleController);

            function bModuleController (aModule) {
                var vm = this;

                vm.fnB = fnB;

                init();

                function init () {
                    vm.fnB();
                }

                function fnB () {
                    aModule.fnA();
                };
            }

            console.log('b', bModule);

        }, 1000);


        console.log('a', aModule);
    });
})();
