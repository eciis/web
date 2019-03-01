(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', ['UserService', 'AuthService', 'WebchatService', 'MessageService', '$scope', function HomeController (UserService, AuthService, WebchatService, MessageService, $scope) {
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

            if (users.forEach) {
                users.forEach(userKey => {
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
            }
            homeCtrl.contacts = parsedUsers;
        };

        homeCtrl.openChat = (user) => {
            homeCtrl.currentUser = user;
            console.log(homeCtrl.client.chats[user.key]);
        };

        homeCtrl.chatCreated = (e) => {
            UserService.getUser(e.id).then(user => {
                homeCtrl.currentChat = e.chat;
                homeCtrl.currentUser = user;
                homeCtrl.currentChat.on('ice-connection-changed', homeCtrl.stateChange);
                homeCtrl.currentChat.on('msg-list-updated', list => {
                    $scope.$apply();
                });
            });
        };

        homeCtrl.stateChange = (state) => {
            homeCtrl.state = state;
            console.log(state);
            $scope.$apply();
        };

        homeCtrl.call = (user) => {
            homeCtrl.client.requestCall(user.key);
            homeCtrl.openChat(user);
        };

        homeCtrl.promptCall = (id) => {
            UserService.getUser(id).then(user => {
                MessageService.showConfirmationDialog({}, "Ligação recebida", `Ligação de ${user.name}. Aceitar?`).then(answer => {
                    if (answer) {
                        homeCtrl.client.acceptCall(id);
                    }
                });
            });
        };
    }]);
})();
