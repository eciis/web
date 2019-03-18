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
            selfieStream: '<',
            remoteStream: '<',
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

        ecisChatCtrl.disableVideo = () => {
            ecisChatCtrl.videoActive = false;
        };

        ecisChatCtrl.enableVideo = () => {
            ecisChatCtrl.videoActive = true;
        };

        ecisChatCtrl.disableAudio = () => {
            ecisChatCtrl.audioActive = false;
        };

        ecisChatCtrl.enableAudio = () => {
            ecisChatCtrl.audioActive = true;
        };

    }

})();