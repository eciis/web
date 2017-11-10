'use strict';

(function() {
    var app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'ngFileUpload',
        'firebase',
        'ngSanitize',
        'ngImgCrop',
        'angularMoment',
        'ngClipboard',
        'ngMaterialDatePicker',
        'ngMessages',
        'angular-timeline',
        'ngMask',
        'ngScrollbars'
    ]);

    app.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');
        $mdThemingProvider.theme('dialogTheme')
            .primaryPalette('teal');

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state("app", {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "app/main/main.html",
                        controller: "MainController as mainCtrl"
                    }
                }
            })
            .state("app.home", {
                url: "/",
                views: {
                    content: {
                        templateUrl: "app/home/home.html",
                        controller: "HomeController as homeCtrl"
                    }
                }
            })
            .state("app.institution", {
                url: "/institution/:institutionKey/details",
                views: {
                    content: {
                        templateUrl: "app/institution/institution_page.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state("app.post", {
                url: "/posts/:key",
                views: {
                    content: {
                        templateUrl: "app/post/post_page.html",
                        controller: "PostPageController as postCtrl",
                    }
                }
            })
            .state("app.manage_institution", {
                abstract: true,
                url: "/institution/:institutionKey",
                views: {
                    content: {
                        templateUrl: "app/institution/management_institution_page.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state("app.manage_institution.members", {
                url: "/managementMembers",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/institution/management_members.html",
                        controller: "ManagementMembersController as manageMemberCtrl"
                    }
                }
            })
            .state("app.events", {
                url: "/events",
                views: {
                    content: {
                        templateUrl: "app/event/event.html",
                        controller: "EventController as eventCtrl",
                    }
                }
            })
            .state("app.event", {
                url: "/event/:eventKey/details",
                views: {
                    content: {
                        templateUrl: "app/event/event_page.html",
                        controller: "EventPageController as eventCtrl",
                    }
                }
            })
            .state("app.manage_institution.edit_info", {
                url: "/edit",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/institution/edit_info.html",
                    }
                }
            })
            .state("app.manage_institution.invite_inst", {
                url: "/inviteInstitution",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/invites/invite_institution_hierarchie.html",
                        controller: "InviteInstHierarchieController as inviteInstCtrl"
                    }
                }
            })
            .state("app.invite_inst", {
                url: "/inviteInstitution",
                views: {
                    content: {
                        templateUrl: "app/invites/invite_institution.html",
                        controller: "InviteInstitutionController as inviteInstCtrl"
                    }
                }
            })
            .state("app.config_profile", {
                url: "/config_profile",
                views: {
                    content: {
                        templateUrl: "app/auth/config_profile.html",
                        controller: "ConfigProfileController as configProfileCtrl"
                    }
                }
            })
            .state("app.search", {
                url: "/search/:search_keyword",
                views: {
                    content: {
                        templateUrl: "app/search/search.html",
                        controller: "SearchController as searchCtrl"
                    }
                }
            })
            .state("new_invite", {
                url: "/:key/new_invite",
                views: {
                    main: {
                        templateUrl: "app/invites/new_invite_page.html",
                        controller: "NewInviteController as newInviteCtrl"
                    }
                }
            })
            .state("process_request", {
                url: "/:key/process_request",
                views: {
                    main: {
                        templateUrl: "app/requests/request_processing.html",
                        controller: "RequestProcessingController as requestCtrl"
                    }
                }
            })
            .state("signin", {
                url: "/signin",
                views: {
                    main: {
                        templateUrl: "app/auth/login.html",
                        controller: "LoginController as loginCtrl"
                    }
                },
                params: {
                    "redirect": undefined
                }
            })
            .state("create_institution", {
                url: "/create_institution",
                views: {
                    main: {
                        templateUrl: "app/institution/create_inst.html"
                    }
                }
            })
            .state("user_inactive", {
                url: "/userinactive",
                views: {
                    main: {
                      templateUrl: "app/user/user_inactive.html",
                      controller: "UserInactiveController as userInactiveCtrl"
                    }
                }
            })
            .state("error", {
                url: "/error",
                views: {
                    main: {
                        templateUrl: "app/error/error.html",
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
                    var location = $injector.get('$location');
                    $state.go("signin", {
                        "redirect": location.path()
                    });
                }

                Utils.updateBackendUrl(config);

                return config || $q.when(config);
            },
            response: function(config) {
                var AuthService = $injector.get('AuthService');
                var user = AuthService.getCurrentUser();
                if (user && user.key) {
                    var pendingInvite = user.getPendingInvitation();
                    if (pendingInvite) {
                        var inviteKey = pendingInvite.key;
                        $state.go("new_invite", {key: inviteKey});
                    }
                }
                return config || $q.when(config);
            },
            responseError: function(rejection) {
                var AuthService = $injector.get('AuthService');
                if (rejection.status === 401) {
                    if (AuthService.isLoggedIn()) {
                        AuthService.logout();
                        rejection.data.msg = "Sua sessão expirou!";
                    } else {
                        var location = $injector.get('$location');
                        $state.go("signin", {
                            "redirect": location.path()
                        });
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

    /**
    * Application listener to filter routes that require active user and set up amCalendar filter configurations.
    * @param {service} AuthService - Service of user authentication
    * @param {service} $transitions - Service of transitions states
    */
    app.run(function userInactiveListener(AuthService, $transitions) {
        var ignored_routes = [
            'create_institution',
            'error',
            'signin',
            'user_inactive',
            'new_invite'
        ];

        $transitions.onStart({
            to: function(state) {
                return !(_.includes(ignored_routes, state.name));
            }
        }, function(transition) {
            var user = AuthService.getCurrentUser();
            var isInactive = user && user.isInactive();

            if (isInactive) {
                transition.router.stateService.transitionTo('user_inactive');
            }
        });

        const dateFormats = {
            calendar: {
                sameDay: '[Hoje às] LT',
                lastWeek: 'DD MMMM [de] YYYY [às] LT',
                sameElse: 'DD MMMM [de] YYYY [às] LT'
            }
        };
        moment.updateLocale('pt-br', dateFormats);
    });
})();