'use strict';

(function() {
    var app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'ngFileUpload',
        'firebase',
        'ngSanitize'
    ]);

    app.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');

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
                        controller: "EditInstController as editInstCtrl"
                    }
                }
            })
            .state("app.manage_institution.invite_inst", {
                url: "/:institutionKey/inviteInstitution",
                views: {
                    content_manage_institution: {
                        templateUrl: "invites/invite_institution_hierarchie.html",
                        controller: "InviteInstHierarchieController as inviteInstCtrl"
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
            .state("new_invite", {
                url: "/:institutionKey/:inviteKey/new_invite",
                views: {
                    main: {
                        templateUrl: "invites/new_invite_page.html",
                        controller: "NewInviteController as newInviteCtrl"
                    }
                }
            })
            .state("submit_institution", {
                url: "/:institutionKey/submitinstitution",
                views: {
                    main: {
                        templateUrl:"institution/submitInstitution.html",
                        controller: "SubmitInstController as submitInstCtrl"
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
                      templateUrl: "error/user_inactive.html",
                      controller: "UserInactiveController as userInactiveCtrl"
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

        $httpProvider.interceptors.push('BearerAuthInterceptor');

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://www.gravatar.com/**'
        ]);
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