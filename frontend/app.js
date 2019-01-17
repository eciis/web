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
        'ngScrollbars',
        'br.cidades.estados'
    ]);

    app.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider,
        $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider, ScrollBarsProvider, STATES) {

        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');
        $mdThemingProvider.theme('dialogTheme')
            .primaryPalette('teal');

        $urlMatcherFactoryProvider.caseInsensitive(true);

        $stateProvider
            .state(STATES.APP, {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "app/main/main.html",
                        controller: "MainController as mainCtrl"
                    }
                }
            })
            .state(STATES.USER, {
                abstract: true,
                views: {
                    content: {
                        templateUrl: "app/home/left_nav.html",
                        controller: "HomeController as homeCtrl"
                    }
                }
            })
            .state(STATES.SEARCH, {
                url: "/search/:search_keyword",
                views: {
                    user_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize(
                                "app/search/search.html",
                                "app/search/search_mobile.html"
                            ),
                        controller: "SearchController as searchCtrl"
                    }
                }
            })
            .state(STATES.HOME, {
                url: "/",
                views: {
                    user_content: {
                        templateUrl: "app/home/home.html"
                    }
                }
            })
            .state(STATES.USER_INSTITUTIONS, {
                url: "/all_institutions",
                views: {
                    user_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/institution/institutions.html", 
                            "app/institution/registered_institutions_mobile.html", 450),
                        controller: "AllInstitutionsController as allInstitutionsCtrl"
                    }
                }
            })
            .state(STATES.EVENTS, {
                url: "/events",
                views: {
                    user_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/event/events.html",
                            "app/event/events_mobile.html", 475),
                        controller: "EventController as eventCtrl",
                    }
                }
            })
            .state(STATES.CREATE_EVENT, {
                url: "/create_event/:eventKey",
                views: {
                    user_content: {
                        templateUrl: "app/event/create_event.html",
                        controller: "EventDialogController as createEventCtrl"
                    }
                },
                params: {
                    event: null,
                    events: null,
                    isEditing: null
                }
            })
            .state(STATES.INVITE_INSTITUTION, {
                url: "/inviteInstitution",
                views: {
                    user_content: {
                        templateUrl: "app/invites/invite_institution.html",
                        controller: "InviteInstitutionController as inviteInstCtrl"
                    }
                }
            })
            .state(STATES.CONFIG_PROFILE, {
                url: "/config_profile",
                views: {
                    user_content: {
                        templateUrl: "app/user/config_profile.html",
                        controller: "ConfigProfileController as configProfileCtrl"
                    }
                }
            })
            .state(STATES.NOTIFICATION, {
                url: "/notifications",
                views: {
                    user_content: {
                        templateUrl: "app/notification/notifications_page.html",
                        controller: "NotificationController as notificationCtrl"
                    }
                }
            })
            .state(STATES.INSTITUTION, {
                abstract: true,
                views: {
                    content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/institution/base_institution_page.html",
                        "app/institution/base_institution_page_mobile.html"),
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state(STATES.INST_TIMELINE, {
                url: "/institution/:institutionKey/home",
                views: {
                    institution_content: {
                        templateUrl: "app/institution/timeline_inst.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state(STATES.INST_FOLLOWERS, {
                url: "/institution/:institutionKey/followers",
                views: {
                    institution_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/institution/followers.html",
                            "app/institution/followers_mobile.html", 475),
                        controller: "FollowersInstController as followersCtrl"
                    }
                }
            })
            .state(STATES.INST_EVENTS, {
                url: "/institution/:institutionKey/institution_events",
                views: {
                    institution_content: {
                        templateUrl: "app/institution/institution_events.html",
                        controller: "EventController as eventCtrl"
                    }
                }
            })
            .state(STATES.INST_MEMBERS, {
                url: "/institution/:institutionKey/members",
                views: {
                    institution_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/institution/members.html",
                            "app/institution/members_mobile.html", 475),
                        controller: "ManagementMembersController as membersCtrl"
                    }
                }
            })
            .state(STATES.INST_REGISTRATION_DATA, {
                url: "/institution/:institutionKey/registration_data",
                views: {
                    institution_content: {
                        templateUrl: "app/institution/registration_data.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state(STATES.INST_LINKS, {
                url: "/institution/:institutionKey/institutional_links",
                views: {
                    institution_content: {
                        templateUrl: "app/institution/institutional_links.html",
                        controller: "InstitutionLinksController as instLinksCtrl"
                    }
                }
            })
            .state(STATES.POST, {
                url: "/posts/:key",
                views: {
                    content: {
                        templateUrl: "app/post/post_page.html",
                        controller: "PostPageController as postCtrl",
                    }
                },
                params: {
                    "focus": undefined
                }
            })
            .state(STATES.MANAGE_INST, {
                abstract: true,
                url: "/institution/:institutionKey",
                views: {
                    content: {
                        templateUrl: "app/institution/management_institution_page.html",
                        controller: "InstitutionController as institutionCtrl"
                    }
                }
            })
            .state(STATES.MANAGE_INST_MEMBERS, {
                url: "/managementMembers",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/institution/management_members.html",
                        controller: "ManagementMembersController as manageMemberCtrl"
                    }
                }
            })
            .state(STATES.EVENT_DETAILS, {
                url: "/event/:eventKey/details",
                views: {
                    user_content: {
                        templateUrl: Utils.selectFieldBasedOnScreenSize("app/event/event_page.html", "app/event/event_details_small_page.html"),
                        controller: Utils.selectFieldBasedOnScreenSize("EventPageController as eventCtrl", "EventDetailsController as eventDetailsCtrl")
                    }
                }
            })
            .state(STATES.MANAGE_INST_EDIT, {
                url: "/edit",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/institution/edit_info.html",
                    }
                }
            })
            .state(STATES.MANAGE_INST_INVITE_INST, {
                url: "/inviteInstitution",
                views: {
                    content_manage_institution: {
                        templateUrl: "app/invites/invite_institution_hierarchie.html",
                        controller: "InviteInstHierarchieController as inviteInstHierCtrl"
                    }
                }
            })
            .state(STATES.NEW_INVITE, {
                url: "/:key/new_invite",
                views: {
                    main: {
                        templateUrl: "app/invites/new_invite_page.html",
                        controller: "NewInviteController as newInviteCtrl"
                    }
                }
            })
            .state(STATES.SIGNIN, {
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
            .state(STATES.CREATE_INST, {
                url: "/create_institution",
                views: {
                    main: {
                        templateUrl: "app/institution/create_inst.html"
                    }
                }
            })
            .state(STATES.CREATE_INST_FORM, {
                url: "/create_institution_form",
                views: {
                    main: {
                        templateUrl: "app/institution/create_inst_form.html",
                        controller: "ConfigInstController as configInstCtrl"
                    }
                },
                params: {
                    senderName: undefined,
                    institutionKey: undefined,
                    inviteKey: undefined
                }
            })
            .state(STATES.ACCEPT_INVITE, {
                url: "/accept_invite?id",
                views: {
                    main: {
                        templateUrl: "app/invites/redirect_invite_institution.html",
                        controller: "RedirectInviteInstitutionController as redirectInviteCtrl"
                    }
                }
            })
            .state(STATES.EMAIL_VERIFICATION, {
                url: "/email_verification",
                views: {
                    main: {
                      templateUrl: "app/auth/email_verification.html",
                      controller: "EmailVerificationController as emailVerifCtrl"
                    }
                }
            })
            .state(STATES.RESET_PASSWORD, {
                url: "/reset_password",
                views: {
                    main: {
                        templateUrl: "/app/auth/reset_password.html",
                        controller: "ResetPasswordController as resetCtrl"
                    }
                }
            })
            .state(STATES.USER_INACTIVE, {
                url: "/user_inactive",
                views: {
                    main: {
                      templateUrl: "app/user/userInactive/user_inactive.html",
                      controller: "UserInactiveController as userInactiveCtrl"
                    }
                }
            })
            .state(STATES.USER_REQUEST, {
                url: '/user_request',
                params: {
                    institution: null
                },
                views: {
                    main: {
                        templateUrl: 'app/user/userRequestForm/user_request_form.html',
                        controller: 'UserRequestFormController as userReqFormCtrl'
                    }
                }
            })
            .state(STATES.ERROR, {
                url: "/error",
                views: {
                    content: {
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

        const dateFormats = {
            calendar: {
                sameDay: '[Hoje às] LT',
                lastWeek: 'DD MMMM [de] YYYY [às] LT',
                sameElse: 'DD MMMM [de] YYYY [às] LT'
            }
        };

        moment.updateLocale('pt-br', dateFormats);

        ScrollBarsProvider.defaults = {
            scrollButtons: {
                scrollAmount: 'auto', // scroll amount when button pressed
                enable: true // enable scrolling buttons by default
            },
            scrollInertia: 200, // adjust however you want
            axis: 'yx', // enable 2 axis scrollbars by default,
            theme: 'minimal-dark',
            autoHideScrollbar: false
        };
    });

    app.factory('BearerAuthInterceptor', function ($injector, $q, $state, STATES) {
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
            response: function(response) {
                var app_version = response.headers("app_version");
                var AuthService = $injector.get('AuthService');
                AuthService.setAppVersion(app_version);
                return response || $q.when(response);
            },
            responseError: function(rejection) {
                var AuthService = $injector.get('AuthService');
                if (rejection.status === 401) {
                    if (AuthService.isLoggedIn()) {
                        AuthService.logout();
                        rejection.data.msg = "Sua sessão expirou!";
                    } else {
                        $state.go(STATES.SIGNIN);
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

    app.run(function authInterceptor(AuthService, $transitions, STATES, $state, $location) {
        var ignored_routes = [
            STATES.SIGNIN,
            STATES.RESET_PASSWORD,
            STATES.ACCEPT_INVITE
        ];

        $transitions.onStart({
            to: function(state) {
                return !(_.includes(ignored_routes, state.name)) && !AuthService.isLoggedIn();
            }
        }, function(transition) {
            $state.go(STATES.SIGNIN, {
                "redirect": $location.path()
            });
        });
    });

    /**
     * Application listener to filter routes that require active user and set up amCalendar filter configurations.
     * @param {service} AuthService - Service of user authentication
     * @param {service} $transitions - Service of transitions states
     */
    app.run(function userInactiveListener(AuthService, $transitions, STATES) {
        var ignored_routes = [
            STATES.CREATE_INST,
            STATES.CREATE_INST_FORM,
            STATES.ERROR,
            STATES.SIGNIN,
            STATES.EMAIL_VERIFICATION,
            STATES.RESET_PASSWORD,
            STATES.USER_INACTIVE,
            STATES.NEW_INVITE,
            STATES.USER_REQUEST
        ];

        $transitions.onStart({
            to: function(state) {
                var user = AuthService.getCurrentUser();
                var isInactive = user && user.isInactive();

                return !(_.includes(ignored_routes, state.name)) && isInactive;
            }
        }, function(transition) {
            transition.router.stateService.transitionTo(STATES.USER_INACTIVE);
        });
    });

    /**
     * Function to intercept the access of pages that should be displayed only on mobile screens.
     * @param {service} $transitions - Service of transitions states
     * @param {const} STATES - Const with the states of application
     * @param {const} SCREEN_SIZES - Const with the screen sizes
     */
    app.run(function mobileInterceptor($transitions, $state, STATES, SCREEN_SIZES) {
        const permitted_routes = [
            STATES.CREATE_EVENT
        ];

        $transitions.onStart({
            to: (state) => {
                return !Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE) && _.includes(permitted_routes, state.name);
            }
        }, () => {
            $state.go(STATES.ERROR, {
                "msg": "Esta página está disponível apenas para mobile.",
                "status": "403"
            });
        });
    });

    app.run(function inviteInterceptor(AuthService, $transitions, $state, STATES) {
        var ignored_routes = [
            STATES.CREATE_INST_FORM
        ];

        $transitions.onSuccess({
            to: function(state) {
                var user = AuthService.getCurrentUser();
                if (user && user.key) {
                    var pendingInvite = user.getPendingInvitation();
                    return pendingInvite && !(_.includes(ignored_routes, state.name));
                }
                return false;
            }
        }, function(transition) {
            var pendingInvite = AuthService.getCurrentUser().getPendingInvitation();
            var inviteKey = pendingInvite.key;
            $state.go(STATES.NEW_INVITE, {key: inviteKey});
        });
    });

    app.run(function jsonPatchUnobserveInterceptor(ObserverRecorderService, $transitions) {
        $transitions.onSuccess({
            to: () => true
        }, function () {
            ObserverRecorderService.unobserveAll();
        });
    });

    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function (registration) {
                const messaging = firebase.messaging();
                messaging.useServiceWorker(registration);
                messaging.usePublicVapidKey(KEY_PAIR);
            });
        }
    }

    (function main() {
        initServiceWorker();
    })();
})();