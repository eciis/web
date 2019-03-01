(function () {
    'use strict';

    angular.module("webchat").component("chatInput", {
        templateUrl: "app/components/chat/input/chat-input.html",
        controller: chatInputController,
        controllerAs: "chatInputCtrl",
        bindings: {
            sendMessageFunc: "<",
            state: "<"
        },
    });

    function chatInputController() {
        const chatInputCtrl = this;

        chatInputCtrl.getState = () => chatInputCtrl.state;

        chatInputCtrl.getStateStyle = () => {
            const state = chatInputCtrl.getState();
            if (_.includes(['connected', 'complete'], state)) {
                return 'lawngreen';
            } else if (_.includes(['failed', 'disconnected', 'closed'], state)) {
                return 'red';
            } else if (_.includes(['new', 'checking'], state)) {
                return 'goldenrod';
            }
            return 'lightgray';
        };

        chatInputCtrl.sendMessage = () => {
            if (chatInputCtrl.msg) {
                chatInputCtrl.sendMessageFunc(chatInputCtrl.msg);
                chatInputCtrl.msg = '';
            }
        };
    }

})();