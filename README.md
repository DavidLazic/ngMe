# ngMe

### Description

Experimentation with Angular-like dependency injection.

### How does it work?

Since ngMe is not an actual SPA (single page application) framework, it doesn't have most of the Angular benefits. I have tried keeping it close to Angular as much as I could, but there were many limitations, like, because there's no router, we cannot specify one controller per view / page. I could update ngMe to have an actual router, but that would lead me to writing other framework parts, which I don't really want to do, as this was intented to be an experiment only.


#### Setting app

Basic idea is this, register an "app" as a module-like instance, declaring it's dependencies the same way you do in Angular and invoking its controller (which will be instantiated on DOM ready event).

````javascript
    ngMe.app('app', [
        'moduleA',
        'moduleB'
    ]).controller('AppController', AppController);

    function AppController (AService, BService) {
        var vm = this;

        vm.initFn = initFn;

        init();

        function init () {
            vm.initFn();
        }

        function initFn () {
            AService.serviceAFn();
            BService.serviceBFn();
        }
    }
````

As you'd traverse through different "routes" (read window.location(s) / pages) of your website, 'AppController' would be always present as one, central controller.

**Notice:** This, ofcourse, doesn't mean you can't have multiple "apps", each with its own controller.


#### Setting modules

I've setup modules' services as Angular factories, so the way they're instantiated is the same. You can even setup circular dependencies as in the example below.

````javascript
    ngMe.module('moduleA', [
        'moduleB'
    ]).factory('AService', AService);

    function AService (BService) {

        function serviceAFn () {
            BService.callFromAService();
        }

        return {
            serviceAFn: serviceAFn
        };
    }

    ngMe.module('moduleB', [
        'moduleA'
    ]).factory('BService', BService);

    function BService (AService) {

        function serviceBFn () {
            AService.serviceAFn();
        }

        function callFromAService () {
            // called from AService
        }

        return {
            serviceBFn: serviceBFn,
            callFromAService: callFromAService
        };
    }
````

#### JS Minify

As far as I've tested, there were no problems with JS minification.


#### Conclusion

Like I wrote, this is just an experiment, my primary goal was to learn the caveats the Angular team had to overcome regarding implementation of DI. I guess this can find some practical use, at least for the fun of writing Angular-like code for some small stuff.

