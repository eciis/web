'use strict';

(function() {
    var app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'ngFileUpload',
        'firebase'
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
            .state("app.manage_institution", {
                abstract: true,
                url: "/institution/:institutionKey/details",
                views: {
                    content: {
                        templateUrl: "institution/management_institution_page.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state("app.manage_institution.invite_user", {
                url: "/:institutionKey/inviteMembers",
                views: {
                    content_manage_institution: {
                        templateUrl: "invites/invite_user.html",
                        controller: "InviteUserController as inviteUserCtrl"
                    }
                }
            })
            .state("app.manage_institution.edit_info", {
                url: "/:institutionKey/edit",
                views: {
                    content_manage_institution: {
                        templateUrl: "institution/edit_info.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state("app.invite_inst", {
                url: "/inviteInstitution",
                views: {
                    content: {
                        templateUrl: "invites/invite_institution.html",
                        controller: "InviteInstitutionController as inviteInstCtrl"
                    }
                }
            })
            .state("config_profile", {
                url: "/config_profile",
                views: {
                    main: {
                        templateUrl: "auth/config_profile.html",
                        controller: "ConfigProfileController as configProfileCtrl"
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
            .state("user_inactive", {
                url: "/userinactive",
                views: {
                    main: {
                      templateUrl: "error/user_inactive.html"
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

        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('BearerAuthInterceptor');

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
            // if (response.status >= 401 & response.status <= 403) {
            //     $state.go("signin", {}, {
            //         reload: true
            //     });
            // } 

            // if (response.status > 403) {
            //     $state.go("error", {
            //         msg: response.error,
            //         status: response.status
            //     }, {
            //         reload: true
            //     });
            // }
            return $q.reject(response);
        };
    });

    app.factory('BearerAuthInterceptor', function ($injector, $q, $state) {
        return {
            request: function(config) {
                var AuthService = $injector.get('AuthService');
                config.headers = config.headers || {};
                if (AuthService.isLoggedIn()) {
                    var token = AuthService.getUserToken();
                    config.headers.Authorization = 'Bearer ' + token;
                } else {
                    $state.go("signin");
                }
                return config || $q.when(config);
            }
        };
    });
})();