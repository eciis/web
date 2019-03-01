(function () {
    'use strict';

    angular.module("webchat").component("ecisChat", {
        templateUrl: "app/components/chat/ecis-chat.html",
        controller: ecisChatController,
        controllerAs: "ecisChatCtrl",
        bindings: {
            chat: '<',
            user: '<',
            callFunc: '<',
            state: '<',
        },
    });

    function ecisChatController() {
        const ecisChatCtrl = this;

        ecisChatCtrl.sendMessage = (msg) => {
            ecisChatCtrl.chat.sendMessage(msg);
        };

        ecisChatCtrl.call = () => {
            ecisChatCtrl.callFunc(ecisChatCtrl.user);
        };
    }

})();