'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('Chat', ['ChatMessage', (ChatMessage) => {
    let messages = [];

    function Chat(stream, selfId) {
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
      this.rpc.oniceconnectionstatechange = this.iceConnectionCB;
      this.rpc.onsignalingstatechange = this.stateCB;
    }

    Chat.prototype.emit = function(eventName, e) {
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName].forEach((f) => {
          f(e);
        });
      }
    }

    Chat.prototype.on = function(eventName, f) {
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = [];
      }
      this.eventHandlers[eventName].push(f);
    }

    Chat.prototype.receiveCandidate = function(candidate) {
      console.log('candidate received', candidate);
      const rtcCandidate = new RTCIceCandidate(candidate);
      this.rpc.addIceCandidate(rtcCandidate);
    }

    Chat.prototype.handleDataChannel = function(e) {
      const chat = this;
      e.channel.onmessage = channelEv => {
        if (channelEv.data) {
          const msg = new ChatMessage(channelEv.data);
          chat.currentMessages.push(msg);
          chat.emit('msg-list-updated', this.currentMessages)
        }
      };
    }

    Chat.prototype.iceConnectionCB = function(ev) {
      console.log('ice connection changed', ev.target.iceConnectionState)
    }

    Chat.prototype.stateCB = function(ev) {
      console.log('state changed', ev.target.signalingState);
    }

    Chat.prototype.offer = function() {
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

    Chat.prototype.setRemote = function(remote) {
      this.rpc.setRemoteDescription(remote);
    }

    Chat.prototype.accept = function(remote) {
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

    Chat.prototype.handleTrack = function(e) {
      this.emit('track-received', e);
    }

    Chat.prototype.sendMessage = function(message) {
      const msgString = JSON.stringify({
        sender: this.selfId,
        timestamp: Date.now(),
        msg: message,
        type: 'text',
      })
      this.sendChannel.send(msgString);
      messages.push(new ChatMessage(msgString));
    }

    Object.defineProperty(Chat.prototype, 'currentMessages', {
      get: () => {
        return messages.sort((p, n) => p.timestamp - n.timestamp);
      }
    })

    return Chat;
  }])
})();
