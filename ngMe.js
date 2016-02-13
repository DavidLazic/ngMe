;(function (window) {
    'use strict';

    /**
     * @description
     * ngMe constructor fn.
     *
     * @param  {Object} params
     * @public
     */
    function ngMe (params) {
        this.params = params || {};
        this.modules = {};
    };

    /**
     * @description
     * Run fn on DOM ready.
     *
     * @param  {Function} cb
     * @return {Function}
     * @public
     */
    ngMe.prototype.run = function (cb) {
        if (typeof cb === 'function') return cb();
    };

    /**
     * @description
     * Instantiate module.
     *
     * @param  {String} moduleName
     * @param  {Array} deps
     * @return {Object}
     * @public
     */
    ngMe.prototype.module = function (moduleName, deps) {
        var __super = this;

        function _resolveDependencies (arr, cb) {
            var resolved = (function () {
                    var requires = [];

                    arr.forEach(function (item) {
                        requires.push(__super.modules[item] || null);
                    });

                    return (requires.indexOf(null) !== -1) ? false : requires;
                })();

            if (resolved) {
                return cb(resolved);
            } else {
                var timeout = setTimeout(function () {
                    clearTimeout(timeout);
                    _resolveDependencies(arr, cb);
                }, 0);
            }

        }

        if (this.isString(moduleName) && this.isArray(deps)) {

            /**
             * @description
             * Module dependency constructor fn.
             *
             * @param {Array} deps
             * @public
             */
            function ModuleConstructor (deps) {
                this.requires = deps;
            }

            /**
             * @description
             * Instantiate module's controller.
             *
             * @param  {String} vm
             * @param  {Function} scope
             * @return {Object}
             * @public
             */
            ModuleConstructor.prototype.controller = function (vm, Scope) {
                var _this = this;

                /**
                 * @description
                 * Module constructor fn.
                 *
                 * @param {String} moduleName
                 * @param {String} vm
                 * @param {Function} scope
                 * @public
                 */
                function Module (moduleName, vm, scope) {
                    this.name = moduleName;
                    this[vm] = scope;
                    this.requires = _this.requires;
                };

                /**
                 * @description
                 * Invoke controller's scope.
                 *
                 * @return {Object}
                 * @public
                 */
                Module.prototype.$$scope = function () {
                    var _this = this;
                    var _args = Array.prototype.slice.call(arguments)[0];

                    document.addEventListener('DOMContentLoaded', function () {
                        _resolveDependencies(_args, function (requires) {
                            _this[vm].apply(_this[vm], requires);
                            return _this;
                        });
                    });
                }

                __super.modules[moduleName] = Scope;

                return (new Module(moduleName, vm, Scope)).$$scope(deps);
            };

            return new ModuleConstructor(Array.prototype.slice.call(deps));
        }

        return {};
    };

    /**
     * @description
     * Check if param is array.
     *
     * @param  {*} param
     * @return {Boolean}
     * @public
     */
    ngMe.prototype.isArray = function (param) {
        return Object.prototype.toString.call(param) === '[object Array]';
    };

    /**
     * @description
     * Check if param is string.
     *
     * @param  {*} param
     * @return {Boolean}
     * @public
     */
    ngMe.prototype.isString = function (param) {
        return typeof param === 'string';
    };

    window.ngMe = new ngMe();
})(window);

;(function () {
    'use strict';

    ngMe.run(function () {

        var bModule = ngMe.module('bModule', ['cModule', 'aModule'])
            .controller('BController', BController);

        function BController (cModule, aModule) {
            var vm = this;

            vm.fnB = fnB;
            vm.callFromA = callFromA;

            init();

            function init () {
                setTimeout(function () {
                    vm.fnB();
                }, 2000);

            }

            function fnB () {
                aModule.fnA();
                document.addEventListener('click', function () {
                    cModule.fnC();
                });

            };

            function callFromA () {
                console.log('called from moduleA');
            }
        }

        ngMe.module('aModule', ['bModule'])
            .controller('AController', AController);

        function AController (bModule) {
            var vm = this;

            vm.fnA = fnA;

            init();

            function init () {
                fnA();
            }

            function fnA () {
                bModule.callFromA();
            };
        }



        var cModule = ngMe.module('cModule', [])
            .controller('CController', CController);

        function CController () {
            var vm = this;

            vm.fnC = fnC;

            function fnC () {
                console.log('fn C');
            }
        }



    });
})();
