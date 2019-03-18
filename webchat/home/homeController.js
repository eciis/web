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
            homeCtrl.currentChat = homeCtrl.client.chats[user.key] || {};

        };

        homeCtrl.chatCreated = (e) => {
            homeCtrl.openChat(homeCtrl.getUser(e.id));

            homeCtrl.currentChat.on('ice-connection-changed', homeCtrl.stateChange);
            homeCtrl.currentChat.on('msg-list-updated', list => {
                $scope.$apply();
            });

        };

        homeCtrl.stateChange = (state) => {
            $scope.$apply();
        };

        homeCtrl.call = (user) => {
            getMedia().then(stream => {
                homeCtrl.client.requestCall(user.key, stream);
            });
        };

        homeCtrl.promptCall = (id) => {
            const user = homeCtrl.getUser(id);

            MessageService.showConfirmationDialog({}, {
                title: user.name,
                subtitle: "Está te ligando você deseja atender essa ligação?",
                confirmAction: () => homeCtrl.acceptCall(user, id),
            });
        };

        homeCtrl.acceptCall = (user, id) => {
            homeCtrl.openChat(user);
            getMedia().then(stream => {
                homeCtrl.client.acceptCall(id, stream);
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
