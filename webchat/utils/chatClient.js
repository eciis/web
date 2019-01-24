'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('ChatClient', ['Chat', (Chat) => {
    const hostname = window.location.hostname;
    const port = 8090;

    function ChatClient(id) {
      this.id = id;
      this.ws = new WebSocket(`ws://${hostname}:${port}`);
      // maps event name to function
      this.eventHandlers = {};
      // maps id to Chat
      this.chats = {};
      //
      this.users = {};
      //
      this.stream = undefined;

      this.ws.onopen = () => {
        const user = {
          type: 'signin',
          name: this.id,
        };
        this.ws.send(JSON.stringify(user));
      };
      // we have to explictly pass a function with the event argument
      // otherwise "this" will refer to the websocket instead of the Client object
      // i.e.: this.ws.onmessage = handleWebSocket
      //                            /\_____ this inside here will be the websocket
      // we could also bind (this) back
      // this.ws.onmessage = this.handleWebSocket(this); <-- also works
      this.ws.onmessage = e => this.handleWebSocket(e);
    }

    ChatClient.prototype.createChat = function (id, stream) {
      const chat = new Chat(stream, this.id);
      this.chats[id] = chat;
      this.emit('chat-created', { id, chat });
      return chat;
    }

    ChatClient.prototype.handleWebSocket = function (e) {
      const data = JSON.parse(e.data);
      console.log('ws event: ', data.type);
      if (data.type === 'callRequest') {
        this.emit('call-requested', data.name);
      } else if (data.type === 'callAnswer') {
        this.offerRpc(data.name);
      } else if (data.type === 'offer') {
        this.answerRpc(data);
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

    ChatClient.prototype.handleAnswer = function(msg) {
      this.chats[msg.name].setRemote(msg);
    }

    ChatClient.prototype.emit = function (eventName, e) {
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName].forEach((f) => {
          f(e);
        });
      }
    }

    ChatClient.prototype.on = function (eventName, f) {
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = [];
      }
      this.eventHandlers[eventName].push(f);
    }

    ChatClient.prototype.addIceCandidate = function (e) {
      if (this.chats[e.name]) {
        this.chats[e.name].receiveCandidate(e.candidate);
      }
    }

    ChatClient.prototype.answerRpc = function (msg) {
      const id = msg.name;
      console.log('offer received, answering ', id);
      const chat = this.chats[id];
      chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(id, e));
      chat.accept(msg).then(connection => {
        this.ws.send(JSON.stringify({
          type: connection.type,
          sdp: connection.sdp,
          name: this.id,
          dest: id,
        }))
      });
    }

    ChatClient.prototype.handleDiscoveredIceCandidates = function (id, e) {
      if (e.candidate) {
        console.log('candidate discovered', e.candidate);
        const msg = {
          type: 'newCandidate',
          name: this.id,
          dest: id,
          candidate: e.candidate,
        };
        this.ws.send(JSON.stringify(msg));
      }
    }

    ChatClient.prototype.offerRpc = function (dest) {
      console.log('call accepted, offering', dest);
      const chat = this.chats[dest];
      chat.on('ice-candidate', e => this.handleDiscoveredIceCandidates(dest, e));
      chat.offer().then(connection => {
        const requestObj = {
          name: this.id,
          dest,
          type: connection.type,
          sdp: connection.sdp,
        };
        this.ws.send(JSON.stringify(requestObj));
      });
    }

    ChatClient.prototype.requestUsers = function () {
      this.ws.send(JSON.stringify({
        name: this.id,
        type: 'requestUsers',
      }));
    }

    ChatClient.prototype.handleUserListUpdate = function (users) {
      this.users = users;
      this.emit('user-list-update', users);
    }

    ChatClient.prototype.call = function (dest, stream) {
      this.stream = this.stream || stream;
      this.chats[dest] = this.createChat(dest, this.stream);

      this.ws.send(JSON.stringify({
        name: this.id,
        dest: dest,
        type: 'callRequest'
      }))
    }

    ChatClient.prototype.acceptCall = function (id, stream) {
      this.stream = this.stream || stream;
      this.createChat(id, this.stream);

      this.ws.send(JSON.stringify({
        name: this.id,
        dest: id,
        type: 'callAnswer'
      }))
    }

    return ChatClient;
  }])
})();
