'use strict';

(function() {
  const app = angular.module('webchat')

  app.factory('ChatMessage', [() => {
    const ChatMessage = class ChatMessage {
      constructor(jsonString) {
        const parsed = JSON.parse(jsonString);
        this.sender = parsed.sender;
        this.timestamp = parsed.timestamp;
        this.msg = parsed.msg;
        this.type = 'text';
      }
    }

    return ChatMessage;
  }]);
})();
