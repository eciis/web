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
            })
            .state("landing.success", {
                url: "/home-sucesso",
                views: {
                    content: {
                        templateUrl: "success.html"
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
            })
            .state("landing.supportinstitutions", {
                url: "/home-instituicoes-mantenedoras",
                views: {
                    content: {
                        templateUrl: "support_institutions.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.terms", {
                url: "/home-termos-de-uso",
                views: {
                    content: {
                        templateUrl: "coming_soon.html",
                        controller: "MainController as ctrl"
                    }
                }
            })
            .state("landing.privacy", {
                url: "/home-privacidade",
                views: {
                    content: {
                        templateUrl: "coming_soon.html",
                        controller: "MainController as ctrl"
                    }
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix(''); // Uses # instead #!
    });
})();