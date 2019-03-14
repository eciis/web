(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', ['UserService', 'AuthService', 'MessageService', '$scope', 'NavbarManagementService',
        function HomeController (UserService, AuthService, MessageService, $scope, NavbarManagementService) {
        const homeCtrl = this;

        homeCtrl.$onInit = () => {
            homeCtrl.client = AuthService.chatClient;
            homeCtrl.cachedUsers = {};

            homeCtrl.getUserList(homeCtrl.client.users);
            homeCtrl.client.on('user-list-updated', homeCtrl.getUserList);
            homeCtrl.client.on('call-requested', homeCtrl.promptCall);
            homeCtrl.client.on('chat-created', homeCtrl.chatCreated);
        };

        homeCtrl.getUserList = (users) => {
            const parsedUsers = [];

            _.forEach(users, userKey => {
                if (userKey !== homeCtrl.client.id) {
                    if (!_.has(homeCtrl.cachedUsers, userKey)) {
                        UserService.getUser(userKey).then(user => {
                            homeCtrl.cachedUsers[userKey] = user;
                            parsedUsers.push(homeCtrl.cachedUsers[userKey]);
                        });
                    } else {
                        parsedUsers.push(homeCtrl.cachedUsers[userKey]);
                    }
                }
            });
            homeCtrl.contacts = parsedUsers;
        };

        homeCtrl.openChat = (user) => {
            homeCtrl.currentUser = user;
            if (Utils.isMobileScreen()) {
                NavbarManagementService.toggleSidenav('left');
            }
        };

        homeCtrl.chatCreated = (e) => {
            homeCtrl.currentUser = homeCtrl.getUser(e.id);
            homeCtrl.currentChat = e.chat;

            homeCtrl.selfieStream = homeCtrl.currentChat.selfStream;

            homeCtrl.currentChat.on('ice-connection-changed', homeCtrl.stateChange);
            homeCtrl.currentChat.on('msg-list-updated', list => {
                $scope.$apply();
            });

            homeCtrl.currentChat.on('track-received', ev => {
                homeCtrl.remoteStream = ev.streams[0];
            });
        };

        homeCtrl.stateChange = (state) => {
            homeCtrl.state = state;
            $scope.$apply();
        };

        homeCtrl.call = (user) => {
            getMedia().then(stream => {
                homeCtrl.client.requestCall(user.key, stream);
            });
        };

        homeCtrl.promptCall = (id) => {
            const user = homeCtrl.getUser(id);

            MessageService.showConfirmationDialog({}, "Ligação recebida", `Ligação de ${user.name}. Aceitar?`).then(answer => {
                if (answer) {
                    homeCtrl.currentUser = user;
                    getMedia().then(stream => {
                        homeCtrl.client.acceptCall(id, stream);
                    });
                }
            });
        };

        function getMedia() {
            return new Promise((resolve, reject) => {
                let stream;
                navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
                    stream = s;
                }).catch(e => console.log(e)).finally(() => resolve(stream));
            });
        }

        homeCtrl.getUser = (id) => {
            return homeCtrl.cachedUsers[id];
        };
    }]);
})();
