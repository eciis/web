'use strict';

(function() {
    var app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate'
    ]);

    app.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state("app", {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "main/main.html",
                        controller: "MainController as mainCtrl"
                    }
                }
            })
            .state("app.home", {
                url: "/",
                views: {
                    content: {
                        templateUrl: "home/home.html",
                        controller: "HomeController as homeCtrl"
                    }
                }
            })
            .state("app.institution", {
                url: "/institution/:institutionKey/details",
                views: {
                    content: {
                        templateUrl: "institution/institution_page.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state("choose_institution", {
                url: "/chooseinstitution",
                views: {
                    main: {
                        templateUrl: "auth/choose_institution.html",
                        controller: "ChooseInstController as chooseInstCtrl"
                    }
                }
            })
            .state("signin", {
                url: "/signin",
                views: {
                    main: {
                        templateUrl: "auth/login.html",
                        controller: "LoginController as loginCtrl"
                    }
                }
            })
            .state("error", {
                url: "/error",
                views: {
                    main: {
                        templateUrl: "error/error.html",
                        controller: "ErrorController as errorCtrl"
                    }
                },
                data: {
                    msg: "Ocorreu um erro.",
                    status: "500"
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(false);
        $locationProvider.hashPrefix(''); // Uses # instead #!

        // alternatively, register the interceptor via an anonymous factory
        $httpProvider.interceptors.push('AuthInterceptor');

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://www.gravatar.com/**'
        ]);
    });

    app.service('AuthInterceptor', function AuthInterceptor($q, $state) {
        var service = this;

        service.responseError = function(response) {
            if (response.status >= 401 & response.status <= 403) {
                $state.go("signin", {}, {
                    reload: true
                });
            } else if (response.status > 403) {
                $state.go("error", {
                    msg: response.error,
                    status: response.status
                }, {
                    reload: true
                });
            }
            return $q.reject(response);
        };
    });
})();