(function () {
    'use strict';

    angular.module("webchat").component("chatMessage", {
        templateUrl: "app/components/chat/message/chat-message.html",
        controller: [
            'AuthService',
            chatMessageController,
        ],
        controllerAs: "chatMessageCtrl",
        bindings: {
            messageObj: '<',
        },
    });

    function chatMessageController(AuthService) {
        const chatMessageCtrl = this;


        chatMessageCtrl.formatTimestamp = (timestamp) => {
            return timestamp.getHours() + ":" + timestamp.getMinutes();
        };

        chatMessageCtrl.$onInit = () => {
            const timestamp = new Date(chatMessageCtrl.messageObj.timestamp);
            chatMessageCtrl.formattedTimestamp = chatMessageCtrl.formatTimestamp(timestamp);
        };

        chatMessageCtrl.messageSent = () => {
            const result = chatMessageCtrl.messageObj.sender === AuthService.getCurrentUser().key;
            return result;
        };
    }

})();