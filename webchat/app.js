'use strict';

(function() {
    var app = angular.module('app', [
        'ui.router',
    ]);

    app.config(function($stateProvider) {
       $stateProvider
           .state("webchat", {
               abstract: true,
               views: {
                    main: {
                        templateUrl: "app/webchat/webchat.html",
                        controller: "WebchatController as controller",
                    },
               },
           })
           .state("webchat.home", {
               url: "/",
               views: {
                   content: {
                       templateUrl: "app/home/home.html",
                       controller: "HomeController as controller",
                   },
               },
           })
           .state("webchat.chat", {
               url: "/chat",
               views: {
                   content: {
                       templateUrl: "app/chat/chat.html",
                       controller: "ChatController as controller",
                   },
               },
           })
           .state("webchat.video", {
               url: "/video",
               views: {
                   content: {
                       templateUrl: "app/video/video.html",
                       controller: "VideoController as controller",
                   },
               },
           })
           .state("login", {
               url: "/login",
               views: {
                   main: {
                       templateUrl: "app/auth/login.html",
                       controller: "LoginController as controller",
                   },
               },
           })
    });

    (function main() {
        console.log("app running");
    })();
})();