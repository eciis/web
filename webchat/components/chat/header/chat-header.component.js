(function () {
    'use strict';

    angular.module("webchat").component("chatHeader", {
        templateUrl: "app/components/chat/header/chat-header.html",
        controller: chatHeaderController,
        controllerAs: "chatHeaderCtrl",
        bindings: {
            user: "<",
            chat: "<",
            callFunc: "<",
            enableVideoFunc: '<',
            disableVideoFunc: '<',
        },
    });

    function chatHeaderController() {
        const chatHeaderCtrl = this;

    }

})();