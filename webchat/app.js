(function() {
  'use strict';

  const app = angular.module('webchat', [
      'ui.router',
      'ngMaterial',
      'firebase'
  ]);

  const rootName = 'webchat';
  app.constant('STATES', {
          abstract: 'webchat',
          home: `${rootName}.home`,
          call: `${rootName}.chat`,
          login: 'login',
      });

  app.config((STATES, $mdIconProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider,
    $httpProvider) => {
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
                      templateUrl: "app/webchat/webchat.html",
                      controller: "WebchatController as controller",
                  },
             },
         })
         .state(STATES.home, {
             url: "/",
             views: {
                 content: {
                     templateUrl: "app/home/home.html",
                     controller: "HomeController as controller",
                 },
             },
         })
         .state(STATES.chat, {
             url: "/chat",
             views: {
                 content: {
                     templateUrl: "app/chat/chat.html",
                     controller: "ChatController as controller",
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
         });

      $urlRouterProvider.otherwise("/");
      $httpProvider.interceptors.push('BearerAuthInterceptor');

  });

  app.factory('BearerAuthInterceptor', function (STATES, $injector, $q, $state) {
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
                      $state.go(STATES.login);
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

  app.run(function authInterceptor(STATES, AuthService, $transitions, $state) {
      const ignored_routes = [
          STATES.login,
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
