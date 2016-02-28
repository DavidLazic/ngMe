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
     * Instantiate new app.
     *
     * @param  {String} name
     * @param  {Array} deps
     * @return {Object}
     * @public
     */
    ngMe.prototype.app = function (name, deps) {

        if (this.isString(name) && this.isArray(deps)) {

            return new App({
                name: name,
                deps: deps
            });
        }

        return {};
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
     * Annotate module.
     *
     * @param  {String} vm
     * @param  {Function|Object} constr
     * @return {Function}
     * @public
     */
    ngMe.prototype.$annotate = function (vm, constr) {
        return function (ctx) {
            ctx.vm = vm;
            ctx[vm] = constr;
            return ctx;
        };
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
     * App constructor fn.
     *
     * @param {Object} params
     * {
     *     name: <String>,
     *     requires: <Array>
     * }
     * @public
     */
    function App (params) {
        this.name = params.name || '';
        this.requires = params.deps || [];
    };

    /**
     * @description
     * Instantiate app's controller.
     *
     * @param  {String} vm
     * @param  {Function} Scope
     * @return {Function}
     * @public
     */
    App.prototype.controller = function (vm, Scope) {
        return __super.$annotate(vm, Scope)(this).$$scope()(this);
    };

    /**
     * @description
     * Invoke controller scope.
     *
     * @return {Function}
     * @public
     */
    App.prototype.$$scope = function () {
        return function (ctx) {
            return __super.$injector.invoke(ctx);
        };
    }

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
     * Instantiate module's service.
     *
     * @param  {String} vm
     * @param  {Function} Service
     * @return {Function}
     * @public
     */
    Module.prototype.service = function (vm, Service) {
        return __super.$annotate(vm, new Service())(this);
    };

    /**
     * @description
     * Injector constructor fn.
     *
     * @public
     */
    function Injector () {
        this.queue = [];
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
        this.queue.push(module);
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
        var _this = this;
        document.addEventListener('DOMContentLoaded', function () {
            _this.$$append();
            return _this.resolve(module)(_this, function (deps) {
                return module[module.vm].apply(module[module.vm], deps);
            });
        });
    };

    /**
     * @description
     * Append service dependencies.
     *
     * @return {Object}
     * @public
     */
    Injector.prototype.$$append = function () {
        var _this = this;
        this.queue.forEach(function (item) {
            var parentVM = item.vm;
            item.requires.forEach(function (dep) {
                var vm = _this.dependencies[dep].vm;
                item[parentVM][vm] = _this.dependencies[dep][vm];
            });
        });
    };

    /**
     * @description
     * Resolve module's dependencies.
     *
     * @param  {Object} module
     * @return {Function}
     * @public
     */
    Injector.prototype.resolve = function (module) {
        var deps = [];

        return function (ctx, cb) {
            module.requires.forEach(function (arg) {
                var vm = ctx.dependencies[arg].vm;
                arg && deps.push(ctx.dependencies[arg][vm]);
            });

            return cb(deps);
        };
    };

    window.ngMe = new ngMe({
        injector: new Injector()
    });

    __super = window.ngMe;
})(window, document);

;(function () {
    'use strict';

    ngMe.app('app', ['moduleA', 'moduleB']).controller('AppController', AppController);

    function AppController (moduleA, moduleB) {
        var vm = this;

        vm.initFn = initFn;

        init();

        function init () {
            vm.initFn();
        }

        function initFn () {
            console.log('initFn');
            moduleA.serviceAFn();
            moduleB.serviceBFn();
        }
    }

    ngMe.module('moduleA', ['moduleB']).service('AService', AService);

    function AService () {

        function serviceAFn () {
            console.log('service fn');
            new BService().fromA();
        }

        return {
            serviceAFn: serviceAFn
        };
    }

    ngMe.module('moduleB', ['moduleA']).service('BService', BService);

    function BService () {

        function serviceBFn () {
            new AService().serviceAFn();
        }

        function fromA () {
            console.log('from A');
        }

        return {
            serviceBFn: serviceBFn,
            fromA: fromA
        };
    }
})();
