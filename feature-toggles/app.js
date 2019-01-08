(function() {
    'use strict';

    const app = angular.module('app', [
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'ngMessages',
    ]);


    app.config(function($mdIconProvider, $mdThemingProvider, $urlMatcherFactoryProvider, $urlRouterProvider, $locationProvider, $stateProvider) {
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
                        templateUrl: "app/signin/signin.html",
                        controller: "SigninController as signinCtrl"
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
        
    });
})();