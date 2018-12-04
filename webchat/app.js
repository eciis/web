(function() {
    'use strict';

    const app = angular.module('webchat', [
        'ui.router',
    ]);

    const rootName = 'webchat';
    app.constant('STATES', {
            abstract: 'webchat',
            home: `${rootName}.home`,
            call: `${rootName}.call`,
            chat: `${rootName}.chat`,
            video: `${rootName}.video`,
            login: 'login',
        });

    app.config((STATES, $stateProvider, $urlRouterProvider) => {
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
           .state(STATES.call, {
               url: "/call",
               views: {
                   content: {
                       templateUrl: "app/video/call.html",
                       controller: "CallController as controller",
                   },
               },
           })
           .state(STATES.video, {
               url: "/video",
               views: {
                   content: {
                       templateUrl: "app/video/video.html",
                       controller: "VideoController as controller",
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