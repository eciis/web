(function() {
    'use strict';

    const app = angular.module('webchat', [
        'ui.router',
        'ngMaterial',
        'ngMessages',
        'firebase',
    ]);

    const rootName = 'main';
    app.constant('STATES', {
            abstract: rootName,
            home: `${rootName}.home`,
            login: 'login',
            error: 'error',
        });

    app.constant('WEBSOCKET', {
      url: "wss://webchat-server-dot-development-cis.appspot.com/",
      maxRetries: 5,
    });

    app.config((STATES, $mdIconProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider,
                $httpProvider, $locationProvider) => {
        $mdIconProvider.fontSet('md', 'material-icons');
        $mdThemingProvider.theme('docs-dark');
        $mdThemingProvider.theme('input')
            .primaryPalette('green');
        $mdThemingProvider.theme('dialogTheme')
            .primaryPalette('teal');

        $stateProvider
           .state(STATES.abstract, {
               abstract: true,
               views: {
                    main: {
                        templateUrl: "app/main/main.html",
                        controller: "mainController",
                        controllerAs: "mainCtrl",
                    },
               },
           })
           .state(STATES.home, {
               url: "/",
               views: {
                   content: {
                       templateUrl: "app/home/home.html",
                       controller: "HomeController",
                       controllerAs: "homeCtrl",
                   },
               },
           })
           .state(STATES.login, {
               url: "/login",
               views: {
                   main: {
                       templateUrl: "app/auth/login.html",
                       controller: "LoginController as controller",
                   },
               },
           })
            .state(STATES.error, {
                url: '/error',
                views: {
                    main: {
                        templateUrl: 'app/error/error.html',
                        controller: 'ErrorController as errorCtrl',
                    },
                },

                params: {
                    'msg': 'Desculpe! Ocorreu um erro.',
                    'status': '500'
                },
            });

        $urlRouterProvider.otherwise(($injector, $location) => {
            const state = $injector.get('$state');

            state.go(STATES.error, {
                msg: `Página não encontrada! "${$location.path()}"`,
                status: '404'
            });

            return;
        });

        $httpProvider.interceptors.push('BearerAuthInterceptor');
        $locationProvider.html5Mode(true);
    });

    app.factory('BearerAuthInterceptor', ['STATES', '$injector', '$q', '$state',
        function (STATES, $injector, $q, $state) {
          return {
              request: function(config) {
                  const AuthService = $injector.get('AuthService');
                  config.headers = config.headers || {};
                  if (AuthService.isLoggedIn()) {
                      return AuthService.getUserToken().then(token => {
                          config.headers.Authorization = 'Bearer ' + token;

                          const API_URL = "/api/";
                          const FIRST_POSITION = 0;
                          const requestToApi = config.url.indexOf(API_URL) == FIRST_POSITION;

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
              const app_version = response.headers("app_version");
              const AuthService = $injector.get('AuthService');
              AuthService.setAppVersion(app_version);
              return response || $q.when(response);
          },
          responseError: function(rejection) {
              const AuthService = $injector.get('AuthService');
              if (rejection.status === 401) {
                  if (AuthService.isLoggedIn()) {
                      AuthService.logout();
                      rejection.data.msg = "Sua sessão expirou!";
                  } else {
                      $state.go(STATES.login);
                  }
              } else if(rejection.status === 403) {
                  rejection.data.msg = "Você não tem permissão para realizar esta operação!";
              } else if(rejection.status === 404) {
                  $state.go(STATES.error, {
                      msg: `URL não encontrada! "${Utils.getApiPath(rejection.config.url)}"`,
                      status: '404'
                  });
              } else {
                  $state.go(STATES.error, {
                      msg: rejection.data.msg || "Desculpa! Ocorreu um erro.",
                      status: rejection.status
                  });
              }
              return $q.reject(rejection);
          }
      };
  }]);

  app.run(function authInterceptor(STATES, AuthService, $transitions, $state) {
      const ignored_routes = [
          STATES.login,
          STATES.error,
      ];

      $transitions.onStart({
          to: function(state) {
              return !(_.includes(ignored_routes, state.name)) && !AuthService.isLoggedIn();
          }
      }, function(transition) {
          $state.go(STATES.login);
      });
  });
})();
