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
            .state("landing.precadastro", {
                url: "/home-pre-cadastro",
                views: {
                    content: {
                        templateUrl: "pre_cadastro.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.comingsoon", {
                url: "/home-em-breve",
                views: {
                    content: {
                        templateUrl: "coming_soon.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.ecisdetails", {
                url: "/home-e-CIS",
                views: {
                    content: {
                        templateUrl: "ecisdetails.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.cisdetails", {
                url: "/home-cis",
                views: {
                    content: {
                        templateUrl: "cisdetails.html",
                        controller: "MainController as ctrl"
                    }
                }
            });


        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix(''); // Uses # instead #!
    });
})();