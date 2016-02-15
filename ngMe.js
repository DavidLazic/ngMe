;(function (window, document) {
    'use strict';

    var __super;

    /**
     * @description
     * ngMe constructor fn.
     *
     * @param  {Object} params
     * {
     *     injector: <Object>
     * }
     * @public
     */
    function ngMe (params) {
        this.$injector = params.injector || {};
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

            return new Module({
                moduleName: moduleName,
                deps: deps
            }).$$register();
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
     * Module constructor fn.
     *
     * @param {Object} params
     * {
     *     name: <String>,
     *     requires: <Array>
     * }
     * @public
     */
    function Module (params) {
        this.name = params.moduleName || '';
        this.requires = params.deps || [];
    };

    /**
     * @description
     * Register module.
     *
     * @return {Function}
     * @public
     */
    Module.prototype.$$register = function () {
        return __super.$injector.add(this);
    };

    /**
     * @description
     * Instantiate module's controller.
     *
     * @param  {Function} Scope
     * @return {Function}
     * @public
     */
    Module.prototype.controller = function (Scope) {
        this.ctrl = Scope;
        return this.$$scope();
    };

    /**
     * @description
     * Invoke controller's scope.
     *
     * @return {Function}
     * @public
     */
    Module.prototype.$$scope = function () {
        var _this = this;
        var timeout = setTimeout(function () {
            clearTimeout(timeout);
            return __super.$injector.invoke(_this);
        }, 0);
    }

    /**
     * @description
     * Injector constructor fn.
     *
     * @public
     */
    function Injector () {
        this.dependencies = {};
    };

    /**
     * @description
     * Register module.
     *
     * @param  {Object} module
     * @return {Object}
     * @public
     */
    Injector.prototype.add = function (module) {
        this.dependencies[module.name] = module;
        return module;
    };

    /**
     * @description
     * Invoke dependency injection.
     *
     * @param  {Object} module
     * @return {Function}
     * @public
     */
    Injector.prototype.invoke = function (module) {
        return this.resolve(module.ctrl, function (deps) {
            try {
                return module.ctrl.apply(module.ctrl || {}, deps);
            } catch (e) {
                var timeout = setTimeout(function () {
                    clearTimeout(timeout);
                    return module.ctrl.apply(module.ctrl || {}, deps);
                }, 0);
            }
        });
    };

    /**
     * @description
     * Resolve module's dependencies.
     *
     * @param  {Function} scope
     * @param  {Function} cb
     * @return {Function}
     * @public
     */
    Injector.prototype.resolve = function (scope, cb) {
        var _this = this;

        return this.getArguments(scope, function (_args) {
            var deps = [];

            _args.forEach(function (arg) {
                if (arg) deps.push(_this.dependencies[arg].ctrl);
            });

            return cb(deps);
        });
    };

    /**
     * @description
     * Get constructor's arguments as dependencies.
     *
     * @param  {Function} scope
     * @param  {Function} cb
     * @return {Function}
     * @public
     */
    Injector.prototype.getArguments = function (scope, cb) {
        var regex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        return cb(scope.toString().match(regex)[1].replace(/ /g, '').split(','));
    };

    window.ngMe = new ngMe({
        injector: new Injector()
    });

    __super = window.ngMe;
})(window, document);

;(function () {
    'use strict';

    ngMe.run(function () {


        var bModule = ngMe.module('bModule', ['cModule', 'aModule'])
            .controller(BController);

        function BController (cModule, aModule) {
            var vm = this;

            vm.fnB = fnB;
            vm.callFromA = callFromA;

            init();

            function init () {
                vm.fnB();
            }

            function fnB () {
                console.log('calling B->A');
                aModule.fnA();
                document.addEventListener('click', function () {
                    cModule.fnC();
                });

            };

            function callFromA () {
                console.log('called from moduleA');
            }
        }


        var aModule = ngMe.module('aModule', ['bModule'])
            .controller(AController);

        function AController (bModule) {
            var vm = this;

            vm.fnA = fnA;

            init();

            function init () {
                fnA();
            }

            function fnA () {
                console.log('A-->B');
                bModule.callFromA();
            };
        }



        var cModule = ngMe.module('cModule', [])
            .controller(CController);

        function CController () {
            var vm = this;

            vm.fnC = fnC;

            function fnC () {
                console.log('fn C');
            }
        }

    });
})();
