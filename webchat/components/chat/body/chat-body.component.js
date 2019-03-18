(function () {
    'use strict';

    angular.module("webchat").component("chatBody", {
        templateUrl: "app/components/chat/body/chat-body.html",
        controller: chatBodyController,
        controllerAs: "chatBodyCtrl",
        bindings: {
            messages: '<',
            videoActive: '<',
            audioActive: '<',
            selfieStream: '<',
            remoteStream: '<',
        },
    });

    function chatBodyController() {
        const chatBodyCtrl = this;

        chatBodyCtrl.$onChanges = (changesObj) => {
            updateSelfieVideo(changesObj);
            updateRemoteVideo(changesObj);
            updateRemoteAudio(changesObj);
        };

        const updateSelfieVideo = (changesObj) => {
            const canUpdate = _.get(changesObj, 'selfieStream.currentValue.active', false);

            if (canUpdate) {
                const selfieVideo = document.getElementById('video-selfie');
                selfieVideo.srcObject = changesObj.selfieStream.currentValue;
                selfieVideo.play();
            }
        };

        const updateRemoteVideo = (changesObj) => {
            const canUpdate = _.get(changesObj, 'remoteStream.currentValue.active', false);

            if (canUpdate) {
                const remoteVideo = document.getElementById('video-remote');
                remoteVideo.srcObject = changesObj.remoteStream.currentValue;
                remoteVideo.play();
            }
        };

        const updateRemoteAudio = (changesObj) => {
            const canUpdate = _.has(changesObj, 'audioActive');

            if (canUpdate) {
                const remoteVideo = document.getElementById('video-remote');
                remoteVideo.muted = changesObj.audioActive.currentValue;
            }
        };
    }

})();