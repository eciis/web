(function () {
    'use strict';

    angular.module("webchat").component("chatBody", {
        templateUrl: "app/components/chat/body/chat-body.html",
        controller: chatBodyController,
        controllerAs: "chatBodyCtrl",
        bindings: {
            messages: '<',
        },
    });

    function chatBodyController() {
        const chatBodyCtrl = this;
    }

})();