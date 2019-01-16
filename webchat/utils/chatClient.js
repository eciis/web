'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('ChatClient', [(Chat, UserService) => {
    const hostname = 'localhost';
    const port = 8090;

    function ChatClient(id) {
      this.id = id;
      this.ws = new WebSocket(`ws://${hostname}:${port}`);
      // maps event name to function
      this.eventHandlers = {};
      // maps id to remote descriptions
      this.remotes = {};
      // maps id to Chat
      this.chats = {};
      //
      this.users = {};

      this.ws.onopen = () => {
        const user = {
          type: 'signin',
          name: this.id,
        };
        this.ws.send(JSON.stringify(user));
        this.requestUsers();
      };
      // we have to explictly pass a function with the event argument
      // otherwise "this" will refer to the websocket instead of the Client object
      // i.e.: this.ws.onmessage = handleWebSocket
      //                            /\_____ this inside here will be the websocket
      // we could also bind (this) back
      // this.ws.onmessage = this.handleWebSocket(this); <-- also works
      this.ws.onmessage = e => this.handleWebSocket(e);
    }

    ChatClient.prototype.createChat = function(id) {
      const chat = new Chat();
      this.chats[id] = chat;
      this.emit('chat-created', { id, chat });
      return chat;
    }

    ChatClient.prototype.handleWebSocket = function(e) {
      const data = JSON.parse(e.data);
      if (data.type === 'offer') {
        const chat = this.createChat(data.name);
        chat.setTempRemote(data);
        this.emit('offer-received', data.name);
      } else if (data.type === 'answer') {
        this.handleAnswer(data);
      } else if (data.candidate) {
        this.addIceCandidate(data);
      } else if (data.type === 'userList') {
        this.handleUserListUpdate(data.users);
      } else {
        this.emit('ws-message', e);
      }
    }

    ChatClient.prototype.emit = function(eventName, e) {
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName].forEach((f) => {
          f(e);
        });
      }
    }

    ChatClient.prototype.on = function(eventName, f) {
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = [];
      }
      this.eventHandlers[eventName].push(f);
    }

    ChatClient.prototype.addIceCandidate = function(e) {
      if (this.chats[e.name]) {
        this.chats[e.name].receiveCandidate(e.candidate);
      }
    }

    ChatClient.prototype.acceptChat = function(id, stream) {
      const chat = this.chats[id];
      chat.setRemote(chat.tempRemote);
      chat.init(stream).then(() => {
        chat.accept().then(connection => {
          this.ws.send(JSON.stringify({
            type: connection.type,
            sdp: connection.sdp,
            name: this.id,
            dest: id,
          }))
          chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(id, e));
        });
      })
    }

    ChatClient.prototype.handleDiscoveredIceCandidates = function(id, e) {
      if (e.candidate) {
        const msg = {
          type: 'newCandidate',
          name: this.id,
          dest: id,
          candidate: e.candidate,
        };
        this.ws.send(JSON.stringify(msg));
      }
    }

    ChatClient.prototype.handleAnswer = function(data) {
      const chat = this.chats[data.name];
      chat.setRemote(data);
    }

    ChatClient.prototype.call = function(dest, stream) {
      const chat = this.createChat(dest);
      chat.init(stream).then(() => {
        chat.offer().then(connection => {
          const requestObj = {
            name: this.id,
            dest,
            type: connection.type,
            sdp: connection.sdp,
          };
          this.ws.send(JSON.stringify(requestObj));
          chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(dest, e));
        });
      });
    }

    ChatClient.prototype.requestUsers = function() {
      this.ws.send(JSON.stringify({
        name: this.id,
        type: 'requestUsers',
      }));
    }

    ChatClient.prototype.handleUserListUpdate = function(users) {
      this.users = users;
      this.emit('userListUpdate', users);
    }

    return ChatClient;
  }])
})();
