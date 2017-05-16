(function() {
  var app = angular.module('app', [
    'ngMaterial', 
    'ui.router'
  ]);

  app.config(function($mdIconProvider, $mdThemingProvider, $stateProvider, $urlMatcherFactoryProvider, 
      $urlRouterProvider,$locationProvider, $httpProvider, $sceDelegateProvider) {

    $mdIconProvider.fontSet('md', 'material-icons');
    $mdThemingProvider.theme('docs-dark');

    $urlMatcherFactoryProvider.caseInsensitive(true);

    $stateProvider
      .state("app", {
          abstract: true,
          views: {
            main: {
              templateUrl: "main.html",  
              controller: "MainController as mainCtrl"
            }
          }
      })
      .state("app.home", {  
          url: "/",  
          views: {
            content: {
              templateUrl: "home.html",  
              controller: "HomeController as homeCtrl"
            }
          },
          authenticate: true
      })
      .state("app.institution", {
          url: "/institution",
          views: {
            content: {
              templateUrl: "institution.html",
              controller: "NewInstitutionController as newInstCtrl"
            }
          },
          authenticate: true
      })
      .state("signin", {
          url: "/signin",
          views: {
            main: {
              templateUrl: "login.html",
              controller: "LoginController as loginCtrl"
            }
          },
          authenticate: false
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
        if (response.status == 401){
            $state.go("signin", {}, {reload: true});
        }
        return $q.reject(response);
    };
  });

})();