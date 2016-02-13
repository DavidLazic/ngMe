;(function (window, document) {
    'use strict';

    /**
     * @description
     * ngMe constructor fn.
     *
     * @param  {Object} params
     * {
     *     options: <Object>
     * }
     * @public
     */
    function ngMe (params) {
        this.options = params && params.options || {};
        this.modules = {};
    };

    /**
     * @description
     * Run fn.
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
     * Instantiate new module.
     *
     * @param  {String} moduleName
     * @param  {Array} deps
     * @return {Object}
     * @public
     */
    ngMe.prototype.module = function (moduleName, deps) {

        if (this.isString(moduleName) && this.isArray(deps)) {

            return new ModuleService({
                __super: this,
                moduleName: moduleName,
                deps: Array.prototype.slice.call(deps)
            });
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

    /**
     * @description
     * ModuleService constructor fn.
     *
     * @param {Object} params
     * {
     *     __super: <Object>,
     *     moduleName: <String>,
     *     deps: <Array>
     * }
     * @public
     */
    function ModuleService (params) {
        this.__super = params.__super || {};
        this.moduleName = params.moduleName || '';
        this.requires = params.deps || {};
    };

    /**
     * @description
     * Instantiate module's controller.
     *
     * @param  {String} vm
     * @param  {Function} scope
     * @return {Object}
     * @public
     */
    ModuleService.prototype.controller = function (vm, Scope) {
        this.__super.modules[this.moduleName] = Scope;

        return (new Module({
            __super: this.__super,
            moduleName: this.moduleName,
            vm: vm,
            scope: Scope,
            requires: this.requires
        })).$$scope(vm);
    };

    /**
     * @description
     * Module constructor fn.
     *
     * @param {Object} params
     * {
     *     __super: <Object>,
     *     moduleName: <String>,
     *     vm: <String>,
     *     scope: <Object>,
     *     requires: <Array>
     * }
     * @public
     */
    function Module (params) {
        this.__super = params.__super || {};
        this.name = params.moduleName || '';
        this[params.vm] = params.scope || {};
        this.requires = params.requires || [];
    };

    /**
     * @description
     * Invoke controller's scope.
     *
     * @param  {String} vm
     * @return {Object}
     * @public
     */
    Module.prototype.$$scope = function (vm) {
        var _this = this;

        document.addEventListener('DOMContentLoaded', function () {
            _resolveDependencies.apply(_this, [_this.requires, function (requires) {
                this[vm].apply(this[vm], requires);
                return this;
            }]);
        });

    }

    /**
     * @description
     * Resolve module's dependencies by instantiating modules in specific order.
     *
     * @param  {Array} arr
     * @param  {Function} cb
     * @return {Function}
     * @private
     */
    function _resolveDependencies (arr, cb) {
        _getResolved.call(this, arr, function (resolved) {
            if (resolved) return cb.call(this, resolved);
        });
    }

    /**
     * @description
     * Get resolved dependencies.
     *
     * @param  {Array} arr
     * @param  {Function} cb
     * @return {Function}
     * @private
     */
    function _getResolved (arr, cb) {
        var _this = this.__super;
        var requires = [];

        arr.forEach(function (item) {
            requires.push(_this.modules[item] || null);
        });

        return cb.call(this, (requires.indexOf(null) !== -1) ? false : requires);
    }

    window.ngMe = new ngMe();
})(window, document);

;(function () {
    'use strict';

    ngMe.run(function () {

        // B MODULE
        ngMe.module('bModule', ['cModule', 'aModule'])
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

        // A MODULE
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

        // C MODULE
        ngMe.module('cModule', [])
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
