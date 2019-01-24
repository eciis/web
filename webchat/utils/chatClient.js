'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('ChatClient', ['Chat', 'WEBSOCKET', (Chat, WEBSOCKET) => {
    const ChatClient = class ChatClient {
      /**
       * Create a new ChatClient (WebRTC wrapper),
       * and automatically start a WebSocket connection.
       * The ChatClient also mediates connections by Chat objects
       * before a RPC connection is succesfully completed.
       * @param {string} id - firebase id of the user
       */
      constructor(id) {
        this.id = id;
        this.ws = {};
        this.retries = 0;
        this.eventHandlers = {};
        this.chats = {};
        this.users = {};
        this.stream = undefined;
        this.startWebsocket();
      }

      /**
       * Starts a new connection with the websocket server.
       */
      startWebsocket() {
        const websocket = `ws://${WEBSOCKET.hostname}:${WEBSOCKET.port}`;
        this.ws = new WebSocket(websocket);

        // Sends a signin message to the websocket as soon as the websocket connects
        this.ws.onopen = () => {
          this.sendToWebsocket('signin', '', {});
          this.retries = 0;
        };

        // Listen to the websocket messages, treating those as "events"
        this.ws.onmessage = e => this.handleWebSocket(e);

        // Retry connection when closed or refused
        this.ws.onclose = () => {
          this.retryWebSocket();
        }
      }

      /**
       * Retries a new connection with the websocket server,
       * with a maximum number of WEBSOCKET.maxRetries (5);
       */
      retryWebSocket() {
        if (this.retries < WEBSOCKET.maxRetries) {
          this.retries += 1;
          console.log('Retrying connection, retry: ', this.retries);
          setTimeout(function () {
            this.startWebsocket()
          }.bind(this), 5000)
        }
      }

      /**
       * Mimics node's on/emit event handlers.
       * Raises an event.
       * @param {string} eventName - name of the event
       * @param {object} e - event data
       */
      emit(eventName, e) {
        if (this.eventHandlers[eventName]) {
          this.eventHandlers[eventName].forEach((f) => {
            f(e);
          });
        }
      }

      /**
       * Mimics node's on/emit event handlers.
       * Adds a callback to an event.
       * @param {string} eventName - name of the event
       * @param {Function} f - function to be called when event is raised.
       */
      on(eventName, f) {
        if (!this.eventHandlers[eventName]) {
          this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(f);
      }

      /**
       * Sends a message (JSON string) to another user via the websocket
       * @param {string} type - type of message
       * @param {string} to - id of the user to send a message to
       * @param {object} data - contents of the message
       */
      sendToWebsocket(type, to, data) {
        const msg = { type, from: this.id, to, data }
        this.ws.send(JSON.stringify(msg));
      }

      /**
       * Create a new Chat object associated to an id of another user
       * @param {string} id - firebase id of the other user
       * @param {MediaStream} stream - a Video/Audio stream for the connection
       *
       * @returns {Chat} a chat object of this connection
       * @fires ChatClient#chat-created
       */
      createChat(id, stream) {
        const chat = new Chat(stream, this.id);
        this.chats[id] = chat;

        /**
         * Event when a new chat is created.
         *
         * @event ChatClient#chat-created
         * @property {string} id - id of the other user associated with this chat
         * @property {Chat} chat - Chat object
         */
        this.emit('chat-created', { id, chat });
        return chat;
      }

      /**
       * Handles events sent by the websocket server,
       * parsing the string content on {e.data} as a javascript regular object.
       * @param {MessageEvent} e - websocket event
       *
       * @listens websocket#call-request
       * @listens websocket#call-answer
       * @listens websocket#rpc-offer
       * @listens websocket#rpc-answer
       * @listens websocket#ice-candidate-received
       * @listens websocket#user-list-update
       */
      handleWebSocket(event) {
        const msg = JSON.parse(event.data);
        console.log('ws event: ', msg.type);
        console.log(msg);

        switch (msg.type) {
          case 'call-request':
            this.handleCallRequest(msg);
            break;
          case 'call-answer':
            this.handleCallAnswer(msg);
            break;
          case 'rpc-offer':
            this.handleRpcOffer(msg);
            break;
          case 'rpc-answer':
            this.handleRpcAnswer(msg);
            break;
          case 'ice-candidate-received':
            this.handleCandidateReceived(msg);
            break;
          case 'user-list-update':
            this.handleUserListUpdate(msg);
            break;
          default:
            this.emit('ws-message', msg);
            break;
        }
      }

      /**
       * Handles a websocket call request message.
       * @param {object} msg - websocket message
       * @property {string} type - 'call-request'
       * @property {string} id - id of the user who has requested the call.
       * @property {object} data - {}
       *
       * @fires ChatClient#call-requested
       */
      handleCallRequest(msg) {
        /**
         * Event when a call has been request by another user
         *
         * @event ChatClient#call-requested
         * @property {string} id - id of the user who has request the call
         */
        this.emit('call-requested', msg.id);
      }

      /**
      * Handles a websocket callAnswer event.
      * Creates a new Chat object,
      * and sends back a message to that user with RPC details.
      * @param {object} msg - websocket message
      * @property {string} type - 'call-answer'
      * @property {string} id - id of the user who has accepted the call.
      * @property {object} data - {}
      * @listens Chat#ice-candidate-discovered
      */
      handleCallAnswer(msg) {
        const to = msg.id;
        const chat = this.chats[to];
        chat.on('ice-candidate-discovered', candidate => this.handleDiscoveredIceCandidates(to, candidate));
        chat.offer().then(connection => {
          this.sendToWebsocket('rpc-offer', to, connection);
        });
      }

      /**
       * Event when a RPC offer has been received.
       *
       * @event websocket#rpc-offer
       */
      /**
       * Handles a websocket offer message.
       * Gets the relevant Chat object,
       * accepts that RPC connection,
       * and sends a message back to the offerer.
       * @param {object} msg - websocket message
       * @property {string} type - 'rpc-offer'
       * @property {string} id - id of the user who has offered
       * @property {object} data - RPC object, with type='offer' and sdp
       * @listens Chat#ice-candidate-discovered
       */
      handleRpcOffer(msg) {
        const id = msg.id;
        console.log('offer received, answering ', id);
        const chat = this.chats[id];
        chat.on('ice-candidate-discovered', e => this.handleDiscoveredIceCandidates(id, e));
        chat.accept(msg.data).then(connection => {
          this.sendToWebsocket('rpc-answer', id, connection);
        });
      }

      /**
       * Handles a RPC answer.
       * Gets the related chat,
       * and completes the connection.
       * @param {object} msg - websocket message
       * @property {String} type - 'rpc-answer'
       * @property {string} id - id of the user who has answered
       * @property {object} data - RPC object, with type='answer' and sdp
       */
      handleRpcAnswer(msg) {
        this.chats[msg.id].setRemote(msg.data);
      }

      /**
      * Event when a ICE candidate has been received.
      *
      * @event websocket#ice-candidate-received
      */
      /**
       * Handles ICE candidate messages from the websocket.
       * Gets the associated chat,
       * and adds the candidate to that RPC.
       * @param {object} msg - websocket message.
       * @property {String} type - newCandidate
       * @property {string} id - id of the user who has sent the candidates
       * @property {candidate} candidate - a ICE candidate to be added by the RPC connection
       */
      handleCandidateReceived(msg) {
        if (this.chats[msg.id]) {
          this.chats[msg.id].receiveCandidate(msg.data);
        }
      }

      /**
       * Event when the list of online users has been updated.
       *
       * @event websocket#userList
       * @property {string} type - userList
       * @property {[string]} users - list of users id currently online
       */
      /**
       * Handles a websocket userList message,
       * propagating that data back as a ChatClient proper event.
       * @param {object} data - event data
       * @listens websocket#user-list-update
       * @fires ChatClient#user-list-updated
       */
      handleUserListUpdate(msg) {
        this.users = msg.data;
        /**
         * @event ChatClient#user-list-updated
         * @property {[string]} users - list of users id currently online
         */
        this.emit('user-list-updated', this.users);
      }

      /**
       * Handles chat event from discovered ice candidates.
       * @param {string} id - id of the user to be sent candidates
       * @param {object} event - event containing the candidate info
       */
      handleDiscoveredIceCandidates(id, event) {
        if (event.candidate) {
          console.log('candidate discovered', event.candidate);
          this.sendToWebsocket('ice-candidate', id, event.candidate);
        }
      }

      /**
       * Calls another user.
       * @param {string} id - id of the user to request a call
       * @param {MediaStream} stream - MediaStream video/audio object of the caller
       */
      requestCall(id, stream) {
        this.stream = this.stream || stream;
        this.chats[id] = this.createChat(id, this.stream);
        this.sendToWebsocket('call-request', id, {});
      }

      /**
       * Accepts a call from another user.
       * @param {string} id - id of the user who has called.
       * @param {MediaStream} stream - MediaStream video/audio object of the answerer
       */
      acceptCall(id, stream) {
        this.stream = this.stream || stream;
        this.createChat(id, this.stream);
        this.sendToWebsocket('call-answer', id, {});
      }

      /**
       * Requests the websocket a list of online users.
       */
      requestUsers() {
        this.sendToWebsocket('user-list-request', '', {});
      }
    }

    return ChatClient;
  }])
})();
