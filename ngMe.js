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
            ctx.$$scope()(ctx);
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
     * @param  {String} vm
     * @param  {Function} Scope
     * @return {Function}
     * @public
     */
    Module.prototype.controller = function (vm, Scope) {
        return __super.$annotate(vm, Scope)(this);
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
     * Invoke scope.
     *
     * @return {Function}
     * @public
     */
    Module.prototype.$$scope = function () {
        return function (ctx) {
            var timeout = setTimeout(function () {
                clearTimeout(timeout);
                return __super.$injector.invoke(ctx);
            }, 0);
        };
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
        return this.resolve(module)(this, function (deps) {
            try {
                (typeof module[module.vm] === 'function') && module[module.vm].apply(module[module.vm] || {}, deps);
            } catch (e) {
                var timeout = setTimeout(function () {
                    clearTimeout(timeout);
                    (typeof module[module.vm] === 'function') && module[module.vm].apply(module[module.vm] || {}, deps);
                }, 0);
            }
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

    ngMe.run(function () {

        ngMe.module('aModule.controller', [
            'aModule.service'
        ]).controller('AController', AController);

        function AController (AService) {
            console.log(AService);
            AService.serviceFn();
        }

        ngMe.module('aModule.service', ['aModule.controller'])
            .service('AService', AService);

        function AService (AController) {

            function serviceFn () {
                console.log('service fn');
                console.log(AController);
            }

            return {
                serviceFn: serviceFn
            };
        }
    });
})();
