(function() {
    'use strict';

    var support = angular.module('support', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'firebase',
        'ngSanitize',
        'angularMoment',
        'ngMessages',
        'ngMask'
    ]);

    support.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');
        $mdThemingProvider.theme('dialogTheme')
            .primaryPalette('teal');

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state("support", {
                abstract: true,
                views: {
                    main: {
                        // templateUrl: "support/main/main.html",
                        // controller: "MainController as mainCtrl"
                    }
                }
            })
            .state("support.user", {
                abstract: true,
                views: {
                    content: {
                        // templateUrl: "support/user/left_nav.html",
                        // controller: "HomeController as homeCtrl"
                    }
                }
            })
            .state("support.user.home", {
                url: "/",
                views: {
                    user_content: {
                        // templateUrl: "support/home/home.html",
                        // controller: "HomeController as homeCtrl"
                    }
                }
            })
            .state("signin", {
                url: "/signin",
                views: {
                    main: {
                        templateUrl: "support/auth/login.html",
                        controller: "LoginController as loginCtrl"
                    }
                },
                params: {
                    "redirect": undefined
                }
            })
            // .state("user_inactive", {
            //     url: "/userinactive",
            //     views: {
            //         main: {
            //           templateUrl: "support/user/user_inactive.html",
            //           controller: "UserInactiveController as userInactiveCtrl"
            //         }
            //     }
            // })
            .state("error", {
                url: "/error",
                views: {
                    main: {
                        templateUrl: "support/error/error.html",
                        controller: "ErrorController as errorCtrl"
                    }
                },
                params: {
                    "msg": "Desculpa! Ocorreu um erro.",
                    "status": "500"
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('BearerAuthInterceptor');

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://www.gravatar.com/**',

            'https://www.youtube.com/**'
        ]);

        const dateFormats = {
            calendar: {
                sameDay: '[Hoje às] LT',
                lastWeek: 'DD MMMM [de] YYYY [às] LT',
                sameElse: 'DD MMMM [de] YYYY [às] LT'
            }
        };

        moment.updateLocale('pt-br', dateFormats);
    });

    support.factory('BearerAuthInterceptor', function ($injector, $q, $state) {
        return {
            request: function(config) {
                var AuthService = $injector.get('AuthService');
                config.headers = config.headers || {};
                if (AuthService.isLoggedIn()) {
                    var token = AuthService.getUserToken();
                    config.headers.Authorization = 'Bearer ' + token;
                }

                Utils.updateBackendUrl(config);

                return config || $q.when(config);
            },
            responseError: function(rejection) {
                var AuthService = $injector.get('AuthService');
                if (rejection.status === 401) {
                    if (AuthService.isLoggedIn()) {
                        AuthService.logout();
                        rejection.data.msg = "Sua sessão expirou!";
                    } else {
                        $state.go("signin");
                    }
                } else if(rejection.status === 403) {
                    rejection.data.msg = "Você não tem permissão para realizar esta operação!";
                } else {
                    $state.go("error", {
                        "msg": rejection.data.msg || "Desculpa! Ocorreu um erro.",
                        "status": rejection.status
                    });
                }
                return $q.reject(rejection);
            }
        };
    });

    support.run(function authInterceptor(AuthService, $transitions, $injector, $state, $location) {
        var ignored_routes = [
            'signin'
        ];

        $transitions.onStart({
            to: function(state) {
                return !(_.includes(ignored_routes, state.name)) && !AuthService.isLoggedIn();
            }
        }, function(transition) {
            $state.go("signin", {
                "redirect": $location.path()
            });
        });
    });

    /**
     * Application listener to filter routes that require active user and set up amCalendar filter configurations.
     * @param {service} AuthService - Service of user authentication
     * @param {service} $transitions - Service of transitions states
     */
    support.run(function userInactiveListener(AuthService, $transitions) {
        var ignored_routes = [
            'error',
            'signin',
            'user_inactive'
        ];

        $transitions.onStart({
            to: function(state) {
                var user = AuthService.getCurrentUser();
                var isInactive = user && user.isInactive();

                return !(_.includes(ignored_routes, state.name)) && isInactive;
            }
        }, function(transition) {
            transition.router.stateService.transitionTo('user_inactive');
        });
    });
})();