(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', function HomeController (ChatClient, AuthService, UserService) {
        const controller = this;

        controller.userList = {};
        controller.users = AuthService.chatClient.users;
        controller.client = {};
        controller.currentChat = {};
        controller.remoteClient = {};

        controller.$onInit = () => {
            console.log('HomeController running');
            controller.client = AuthService.getChatClient();
            controller.remoteClient = new ChatClient('remote-me');
            controller.getUserList();
            controller.client.on('userListUpdate', controller.getUserList);
            controller.remoteClient.on('offer-received', callPrompt);
            controller.client.on('chat-created', e => {
              e.chat.on('msg-received', ev => {
                console.log(ev);
              })

              e.chat.on('track-received', ev => {
                document.getElementById('video-remote').srcObject = ev.streams[0];
              })
            })
            controller.remoteClient.on('chat-created', e => {
              e.chat.on('msg-received', ev => {
                console.log(ev);
              })
            })
        };

        controller.updateUsers = () => {
          controller.client.requestUsers();
        }

        controller.call = () => {
          navigator.mediaDevices.getUserMedia({ video: {width: 640, height: 480} }).then(stream => {
            controller.client.call('remote-me', stream);
            // angular.element not working here
            document.getElementById('video-selfie').srcObject = stream;
          });
        }

      controller.getUserList = () => {
        let parsedList = {};
        controller.users.forEach(userKey => {
          UserService.getUser(userKey).then((res) => {
            parsedList[userKey] = res.name;
          });
        });

        controller.userList = parsedList;
      }

      function callPrompt(id) {
        const answer = confirm(`${id} has called. accept?`);
        if (answer) {
          navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then(stream => {
            controller.remoteClient.acceptCall(id, stream);
          });
        }
      }
    });
})();
