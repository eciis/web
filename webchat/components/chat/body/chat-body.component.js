(function () {
    'use strict';

    angular.module("webchat").component("chatBody", {
        templateUrl: "app/components/chat/body/chat-body.html",
        controller: chatBodyController,
        controllerAs: "chatBodyCtrl",
        bindings: {
            messages: '<',
            videoActive: '<',
            selfieStream: '<',
            remoteStream: '<',
        },
    });

    function chatBodyController() {
        const chatBodyCtrl = this;

        chatBodyCtrl.$onChanges = (changesObj) => {
            updateSelfieVideo(changesObj);
            updateRemoteVideo(changesObj);
        };

        const updateSelfieVideo = (changesObj) => {
            if (_.has(changesObj, 'selfieStream.currentValue')) {
                const selfieVideo = document.getElementById('video-selfie');
                selfieVideo.srcObject = chatBodyCtrl.selfieStream;
                selfieVideo.play();
            }
        };

        const updateRemoteVideo = (changesObj) => {
            if (_.has(changesObj, 'remoteStream.currentValue')) {
                const remoteVideo = document.getElementById('video-remote');
                remoteVideo.srcObject = chatBodyCtrl.remoteStream;
                remoteVideo.play();
            }
        };
    }

})();