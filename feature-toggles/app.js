(function() {
    'use strict';

    const app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'ngMessages',
    ]);


    app.config(function($mdIconProvider, $mdThemingProvider, $urlMatcherFactoryProvider, $urlRouterProvider, 
        $locationProvider, $stateProvider, $httpProvider) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');
        $mdThemingProvider.theme('dialogTheme')
            .primaryPalette('teal');

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state("signin", {
                url: "/signin",
                views: {
                    main: {
                        templateUrl: "app/auth/login.html",
                        controller: "LoginController as loginCtrl"
                    }
                }
            }).state("manage-features", {
                url: "/",
                views: {
                    main: {
                        templateUrl: "app/manage/manage-toggles.html",
                        constroller: "ManageTogglesController as ManageTogglesCtrl"
                    }
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('BearerAuthInterceptor');
        
    });

    app.factory('BearerAuthInterceptor', function ($injector, $q, $state) {
        return {
            request: function(config) {
                var AuthService = $injector.get('AuthService');
                config.headers = config.headers || {};
                if (AuthService.isLoggedIn()) {
                    return AuthService.getUserToken().then(token => {
                        config.headers.Authorization = 'Bearer ' + token;                        
                        
                        var API_URL = "/api/";
                        var FIRST_POSITION = 0;
                        var requestToApi = config.url.indexOf(API_URL) == FIRST_POSITION;
                        
                        if (!_.isEmpty(AuthService.getCurrentUser().institutions) && requestToApi) {
                            config.headers['Institution-Authorization'] = AuthService.getCurrentUser().current_institution.key;
                        }

                        Utils.updateBackendUrl(config);
                        return config || $q.when(config);
                    });
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
})();