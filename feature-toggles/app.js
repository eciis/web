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
            .state("main", {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "app/main/main.html",
                        controller: "MainController as mainCtrl"
                    }
                }
            }).state("manage-features", {
                url: "/",
                views: {
                    content: {
                        templateUrl: "app/manage/manage-toggles.html"
                    }
                }
            });

        $urlRouterProvider.otherwise("/");

        $locationProvider.html5Mode(true);
    });
})();