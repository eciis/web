(function() {
    'use strict';

    const app = angular.module('webchat', [
        'ui.router',
    ]);

    const rootName = 'webchat';
    app.constant('WEBCHAT', {
        states: {
            abstract: 'webchat',
            home: `${rootName}.home`,
            call: `${rootName}.call`,
            chat: `${rootName}.chat`,
            video: `${rootName}.video`,
            login: 'login',
        },
        currentUser: null,
    });

    app.config((WEBCHAT, $stateProvider, $urlRouterProvider) => {
       $stateProvider
           .state(WEBCHAT.states.abstract, {
               abstract: true,
               views: {
                    main: {
                        templateUrl: "app/webchat/webchat.html",
                        controller: "WebchatController as controller",
                    },
               },
           })
           .state(WEBCHAT.states.home, {
               url: "/",
               views: {
                   content: {
                       templateUrl: "app/home/home.html",
                       controller: "HomeController as controller",
                   },
               },
           })
           .state(WEBCHAT.states.chat, {
               url: "/chat",
               views: {
                   content: {
                       templateUrl: "app/chat/chat.html",
                       controller: "ChatController as controller",
                   },
               },
           })
           .state(WEBCHAT.states.call, {
               url: "/call",
               views: {
                   content: {
                       templateUrl: "app/video/call.html",
                       controller: "CallController as controller",
                   },
               },
           })
           .state(WEBCHAT.states.video, {
               url: "/video",
               views: {
                   content: {
                       templateUrl: "app/video/video.html",
                       controller: "VideoController as controller",
                   },
               },
           })
           .state(WEBCHAT.states.login, {
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