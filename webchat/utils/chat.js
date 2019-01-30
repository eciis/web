'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('Chat', ['ChatMessage', (ChatMessage) => {
    const Chat = class Chat {
      /**
       * Creates a new Chat object, which will handle a webrtc peer connection,
       * its events and video/audio/data channels functionality.
       * @param {MediaStream} stream - video/audio stream object
       * @param {string} selfId - firebase id of the current user
       */
      constructor(stream, selfId) {
        this.selfId = selfId;
        this._selfStream = stream;
        this.rpc = new RTCPeerConnection([{
          url: 'stun:stun.l.google.com:19302',
          url: 'stun:stun2.l.google.com:19302',
          url: 'stun:stun3.l.google.com:19302',
        }]);
        this.eventHandlers = {};
        stream.getTracks().forEach(t => {
          this.rpc.addTrack(t, stream)
        });
        this.rpc.onicecandidate = e => this.emit('ice-candidate-discovered', e);
        this.sendChannel = this.rpc.createDataChannel('sendChannel');
        this.rpc.ondatachannel = this.handleDataChannel.bind(this);
        this.rpc.ontrack = e => this.emit('track-received', e);
        this.rpc.oniceconnectionstatechange = this.handleIceConnectionState.bind(this);
        this.rpc.onsignalingstatechange = this.handleState.bind(this);
        this._currentMessages = [];
      }

      get selfStream() {
        return this._selfStream;
      }

      /**
       * Mimics node's on/emit event handlers.
       * Raises an event.
       * @param {string} eventName - name of the event
       * @param {object} event - event data
       */
      emit(eventName, event) {
        if (this.eventHandlers[eventName]) {
          this.eventHandlers[eventName].forEach((callback) => {
            callback(event);
          });
        }
      }

      /**
       * Mimics node's on/emit event handlers.
       * Adds a callback to an event.
       * @param {string} eventName - name of the event
       * @param {Function} callback - function to be called when event is raised.
       */
      on(eventName, callback) {
        if (!this.eventHandlers[eventName]) {
          this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(callback);
      }

      /**
       * Adds an ice candidate to the current connection,
       * received from the websocket signaling server.
       * @param {Object} candidate - RTCIceCandidate to be added to this connection
       */
      receiveCandidate(candidate) {
        console.log('candidate received', candidate);
        const rtcCandidate = new RTCIceCandidate(candidate);
        this.rpc.addIceCandidate(rtcCandidate);
      }

      /**
       * Handles data channel events from the RTC Peer Connection.
       * Currently only message (text) events are handled,
       * raising a msg-list-updated event.
       * @param {Event} e - data channel event to be handled
       *
       * @fires Chat#msg-list-updated
       */
      handleDataChannel(e) {
        const chat = this;
        e.channel.onmessage = channelEv => {
          if (channelEv.data) {
            const msg = new ChatMessage(channelEv.data);
            chat._currentMessages.push(msg);

            /**
             * Event when the currentMessages property has been updated.
             *
             * @event Chat#msg-list-updated
             * @property [ChatMessage] - current list of ChatMessages
             */
            chat.emit('msg-list-updated', chat.currentMessages)
          }
        };
      }

      /**
       * Handles a ice connection state change event,
       * propagating it back as another event through the Chat object.
       * Usefull for detecting when a connection is being attempted,
       * disconnected or otherwise closed for some reason.
       * Possible states are:
       *  'new', 'checking', 'connected/completed', 'failed/disconnected/closed',.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceConnectionState
       *
       * @param {Event} ev - full event of a ice connection state change.
       * Its target is the current Remote Peer connection.
       *
       * @fires Chat#ice-connection-changed
       */
      handleIceConnectionState(ev) {
        this.emit('ice-connection-changed', ev.target.iceConnectionState)
      }

      /**
       * Handles a state connection change event,
       * propagating it back as another event through the Chat object.
       *
       * @param {Event} ev - full event of a connection state change.
       * Its target is the current Remote Peer connection.
       *
       * @fires Chat#state-changed
       */
      handleState(ev) {
        this.emit('state-changed', ev.target.signalingState)
      }

      /**
       * Starts a new RPC as the offerer, resolve the promise with the session object.
       *
       */
      offer() {
        return this.rpc.createOffer().then(offer => {
          return this.rpc.setLocalDescription(offer).then(() => {
            return offer;
          }).catch(e => {
            console.log('Erro em local description apos offer', e);
          });
        }).catch(e => {
          console.log('Erro em offer', e);
        });
      }

      /**
       * Adds a new remote session object (answer) as the remote description of current Chat.
       * Used to set the remote description when started as the offerer.
       * @param {string} remote - remote session object.
       */
      setRemote(remote) {
        this.rpc.setRemoteDescription(remote);
      }

      /**
       * Starts a new RPC accepting a remote offer, resolves the promise with the answer object.
       * @param {objet} remote - remote session object.
       */
      accept(remote) {
        return this.rpc.setRemoteDescription(remote).then(() => {
          return this.rpc.createAnswer().then(answer => {
            return this.rpc.setLocalDescription(answer).then(() => {
              return answer;
            })
          }).catch(e => {
            console.log('Erro em answer', e);
          });
        })
      }

      /**
       * Handles a track added event and propagantes it back through the Chat object.
       * The video/audio object can be obtained through e.streams[0].
       * @param {Event} e - event which contains the stream object and its tracks.
       */
      handleTrack(e) {
        this.emit('track-received', e);
      }

      /**
       * Sends a ChatMessage to the other user through the data channel.
       * Adds Date.now() as the timestamp.
       * @param {string} message - Message contents to be sent
       */
      sendMessage(message) {
        const msgString = JSON.stringify({
          sender: this.selfId,
          timestamp: Date.now(),
          msg: message,
          type: 'text',
        })
        this.sendChannel.send(msgString);
        this._currentMessages.push(new ChatMessage(msgString));
      }

      get currentMessages() {
        return this._currentMessages.sort((p, n) => p.timestamp - n.timestamp);
      }
    }

    return Chat;
  }])
})();
