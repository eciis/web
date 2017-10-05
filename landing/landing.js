'use strict';

(function() {
    var landing = angular.module('landing', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'firebase',
        'ngSanitize',
    ]);

    landing.config(function($stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider) {

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state("landing", {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "main.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.home", {
                url: "/",
                views: {
                    content: {
                        templateUrl: "home.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.presignup", {
                url: "/home-pre-cadastro",
                views: {
                    content: {
                        templateUrl: "pre_signup.html",
                        controller: "MainController as ctrl"
                    }
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix(''); // Uses # instead #!
    });
})();