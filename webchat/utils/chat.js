'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('Chat', [() => {
    function Chat() {
      this.rpc = new RTCPeerConnection([
        { url: 'stun:stun.l.google.com:19302' }
      ]);
      this.eventHandlers = {};
      this.pendingCandidates = [];
      this.tempRemote = {};
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
      if (this.rpc.remoteDescription == null) {
        this.pendingCandidates.push(candidate);
        return;
      }
      const rtcCandidate = new RTCIceCandidate(candidate);

      this.rpc.addIceCandidate(rtcCandidate);
    }

    Chat.prototype.handleDataChannel = function(e) {
      const chat = this;
      e.channel.onmessage = channelEv => chat.emit('msg-received', channelEv);
    }

    Chat.prototype.init = function(stream) {
      stream.getTracks().forEach(t => this.rpc.addTrack(t, stream));
      this.sendChannel = this.rpc.createDataChannel('sendChannel');
      this.rpc.ondatachannel = this.handleDataChannel.bind(this);
      this.rpc.ontrack = this.handleTrack.bind(this);
      this.rpc.onicecandidate = e => this.emit('ice-candidate', e);
    }

    Chat.prototype.offer = function() {
      return this.rpc.createOffer().then(offer => {
        return this.rpc.setLocalDescription(offer).then(() => {
          return offer;
        })
      });
    }

    Chat.prototype.setTempRemote = function(remote) {
      this.tempRemote = remote;
    }

    Chat.prototype.setRemote = function(remote) {
      this.rpc.setRemoteDescription(remote);
    }

    Chat.prototype.accept = function() {
      return this.rpc.setRemoteDescription(this.tempRemote).then(() => {
        return this.rpc.createAnswer().then(answer => {
          return this.rpc.setLocalDescription(answer).then(() => {
            if (this.pendingCandidates > 0) {
              this.pendingCandidates.forEach(c => this.receiveCandidate(c));
            }
            return answer;
          })
        });
      })
    }

    Chat.prototype.handleTrack = function(e) {
      this.emit('track-received', e);
    }

    Chat.prototype.sendMessage = function(message) {
      this.sendChannel.send(message);
      this.emit('msg-sent', message);
    }

    return Chat;
  }])
})();
