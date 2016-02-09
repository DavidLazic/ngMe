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
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof cb === 'function') return cb();
        });
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
                    var _arguments = Array.prototype.slice.call(arguments);
                    var requires = [];

                    _arguments[0].forEach(function (arg) {
                        requires.push(__super.modules[arg]);
                    });

                    _this[vm].apply(_this[vm], requires);
                    return _this;
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

        var aModule = ngMe.module('aModule', []);

        aModule.controller('AController', AController);
        function AController () {
            var vm = this;

            vm.fnA = fnA;

            function fnA () {
                console.log('fnA called from bModule');
            };
        }



        var cModule = ngMe.module('cModule', [])
            .controller('CController', CController);

        function CController () {
            var vm = this;

            console.log('CCC');
            vm.fnC = fnC;

            function fnC () {
                console.log('fn C');
            }
        }



        var bModule = ngMe.module('bModule', ['cModule', 'aModule'])
            .controller('BController', BController);

        function BController (cModule, aModule) {
            var vm = this;

            vm.fnB = fnB;

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
        }
    });
})();
