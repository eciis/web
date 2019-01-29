'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('Chat', ['ChatMessage', (ChatMessage) => {
    const Chat = class Chat {
      constructor(stream, selfId) {
        this.selfId = selfId;
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

      emit(eventName, e) {
        if (this.eventHandlers[eventName]) {
          this.eventHandlers[eventName].forEach((f) => {
            f(e);
          });
        }
      }

      on(eventName, f) {
        if (!this.eventHandlers[eventName]) {
          this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(f);
      }

      receiveCandidate(candidate) {
        console.log('candidate received', candidate);
        const rtcCandidate = new RTCIceCandidate(candidate);
        this.rpc.addIceCandidate(rtcCandidate);
      }

      handleDataChannel(e) {
        const chat = this;
        e.channel.onmessage = channelEv => {
          if (channelEv.data) {
            const msg = new ChatMessage(channelEv.data);
            chat._currentMessages.push(msg);
            chat.emit('msg-list-updated', chat.currentMessages)
          }
        };
      }

      handleIceConnectionState(ev) {
        this.emit('ice-connection-changed', ev.target.iceConnectionState)
      }

      handleState(ev) {
        this.emit('state-changed', ev.target.signalingState)
      }

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

      setRemote(remote) {
        this.rpc.setRemoteDescription(remote);
      }

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

      handleTrack(e) {
        this.emit('track-received', e);
      }

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
