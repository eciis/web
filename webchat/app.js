(function() {
    'use strict';

    const app = angular.module('webchat', [
        'ui.router',
        'ngMaterial',
        'ngMessages'
    ]);

    const rootName = 'webchat';
    app.constant('STATES', {
            abstract: 'webchat',
            home: `${rootName}.home`,
            chat: `${rootName}.chat`,
            login: 'login',
        });

    app.config((STATES, $stateProvider, $urlRouterProvider) => {
       $stateProvider
           .state(STATES.abstract, {
               abstract: true,
               views: {
                    main: {
                        templateUrl: "app/webchat/webchat.html",
                        controller: "WebchatController",
                        controllerAs: "webchatCtrl",
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

    });

    const main = () => {
        console.log("app running");
    };

     main();

})();