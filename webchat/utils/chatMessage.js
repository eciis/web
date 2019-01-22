'use strict';

(function() {
  const app = angular.module('webchat')

  app.factory('ChatMessage', [() => {
    function ChatMessage(jsonString) {
      const parsed = JSON.parse(jsonString);
      this.sender = parsed.sender;
      this.timestamp = parsed.timestamp;
      this.msg = parsed.msg;
      this.type = 'text';
    }

    return ChatMessage;
  }]);
})();
