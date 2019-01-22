(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', function HomeController (AuthService, UserService) {
        const controller = this;

        controller.userList = {};
        controller.client = {};
        controller.chat = {};
        controller.dest = '';
        controller.msg = '';
        controller.msgList = () => {
          return controller.chat.currentMessages;
        };

        controller.sendMessage = () => {
          controller.chat.sendMessage(controller.msg);
          controller.msg = '';
        }

        controller.$onInit = () => {
            console.log('HomeController running');
            controller.client = AuthService.getChatClient();
            controller.getUserList(controller.client.users);
            controller.client.on('offer-received', callPrompt);
            controller.client.on('user-list-update', controller.getUserList);
            controller.client.on('chat-created', e => {
              controller.chat = e.chat;

              controller.chat.on('msg-list-updated', ev => {
              })

              controller.chat.on('track-received', ev => {
                console.log('track received', ev)
                document.getElementById('video-remote').srcObject = ev.streams[0];
              })
            })
        };

        controller.updateUsers = () => {
          controller.client.requestUsers();
        }

        controller.getName = (id) => {
          return this.userList[id];
        }

        controller.formatTime = (timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        }

        controller.call = (id) => {
          getMedia().then(stream => {
            controller.client.call(id, stream);
            // angular.element not working here
            document.getElementById('video-selfie').srcObject = stream;
          });
        }

      controller.getUserList = (users) => {
        let parsedList = {};
        if (users.forEach) {
          users.forEach(userKey => {
            UserService.getUser(userKey).then((res) => {
              parsedList[userKey] = res.name;
            });
          });

        }

        controller.userList = parsedList;
      }

      function callPrompt(id) {
        const answer = confirm(`${id} has called. accept?`);
        if (answer) {
          getMedia().then(stream => {
            controller.client.acceptCall(id, stream);
            document.getElementById('video-selfie').srcObject = stream;
          });
        }
      }

      function getMedia() {
        return new Promise((resolve, reject) => {
          let stream = new MediaStream();
            navigator.mediaDevices.getUserMedia({video:true}).then(s => {
              stream = s;
              resolve(stream)
            }).catch(_ => {
              resolve(stream);
            })
        })
      }
    });
})();
