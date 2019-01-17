'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('Chat', [() => {
    function Chat(stream) {
      this.rpc = new RTCPeerConnection([
        { url: 'stun:stun.l.google.com:19302' }
      ]);
      this.eventHandlers = {};
      this.pendingCandidates = [];
      this.rpc.onicecandidate = e => this.emit('ice-candidate', e);
      stream.getTracks().forEach(t => this.rpc.addTrack(t, stream));
      this.sendChannel = this.rpc.createDataChannel('sendChannel');
      this.rpc.ondatachannel = this.handleDataChannel.bind(this);
      this.rpc.ontrack = e => this.emit('track-received', e);
      this.rpc.oniceconnectionstatechange = this.iceConnectionCB.bind(this);
      this.rpc.onsignalingstatechange = this.stateCB.bind(this);
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
      console.log('candidate received');
      if (this.rpc.remoteDescription == null) {
        console.log('no remote');
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
    }

    Chat.prototype.iceConnectionCB = function() {
      console.log(`Ice connection changed to ${this.rpc.iceConnectionState}`)
    }

    Chat.prototype.stateCB = function() {
      console.log(`State connection changed to ${this.rpc.signalingState}`)
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

    Chat.prototype.accept = function(remote) {
      return this.rpc.setRemoteDescription(remote).then(() => {
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
