'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray,  MessageService, AuthService) {
        var service = this;

        var ref = firebase.database().ref();

        var firebaseArrayNotifications;

        var TRANSLATE_MESSAGE = {
            'COMMENT': 'comentou o seu post',
            'POST': 'publicou um novo post',
            'SHARED_POST': 'compartilhou seu post',
            'INVITE': 'te enviou um novo convite',
            'INSTITUTION': 'removeu a conexão entre suas instituições',
            'REQUEST_USER': 'solicitou ser membro de sua instituição',
            'REQUEST_INSTITUTION_PARENT': 'solicitou um novo vínculo entre sua instituição e a dele',
            'REQUEST_INSTITUTION_CHILDREN': 'solicitou um novo vínculo entre sua instituição e a dele',
            'REQUEST_INSTITUTION': 'deseja criar uma nova institutição',
            'REPLY_COMMENT': 'respondeu o seu comentário',
            'LIKE_COMMENT': 'curtiu seu comentário',
            'LIKE_POST': 'curtiu seu post',
            'REJECT_INSTITUTION_LINK': 'rejeitou sua solicitação de vínculo entre instituições',
            'ACCEPT_INSTITUTION_LINK': 'aceitou sua solicitação de vínculo entre instituições',
            'REJECT_INVITE_USER': 'rejeitou o convite para ser membro de sua instituição',
            'ACCEPT_INVITE_USER': 'aceitou o convite para ser membro de sua instituição',
            'REJECT_INVITE_INSTITUTION': 'rejeitou o seu convite para ser administrador',
            'ACCEPT_INVITE_INSTITUTION': 'aceitou o seu convite para ser administrador'
        };

        var POST_NOTIFICATION = 'POST';
        var CHILD_ADDED = "child_added";

        service.formatMessage = function formatMessage(notification) {
            var message = TRANSLATE_MESSAGE[notification.type];
            return notification.from+" "+message;
        };

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            setupNotifications(userKey, function() {
                _.forEach(firebaseArrayNotifications, function each(notification) {
                    if (isNew(notification)) {
                        notificationsList.push(notification);
                    }
                });

                firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = firebaseArrayNotifications.$getRecord(ev.key);
                        notificationsList.push(notification);

                        if (isNew(notification)) {
                            MessageService.showToast(service.formatMessage(notification));
                        }
                    }
                });
            });
        };

        service.watchPostNotification = function watchPostNotification(userKey, callback) {
            setupNotifications(userKey, function() {
                firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = firebaseArrayNotifications.$getRecord(ev.key);
                        if (notification.type === POST_NOTIFICATION) {
                            callback();
                        }
                    }
                });
            });
        };

        service.markAsRead = function markAsRead(notification) {
            notification.status = "READ";
            return firebaseArrayNotifications.$save(notification);
        };

        function setupNotifications(userKey, callback) {
            if (!firebaseArrayNotifications) {
                var notificationsRef = ref.child("notifications/"+userKey);
                firebaseArrayNotifications = $firebaseArray(notificationsRef);
            }
            firebaseArrayNotifications.$loaded().then(function() {
                callback();
            });
        }

        function isNew(notification) {
            return notification.status === "NEW";
        }

        /**
        * Start watch AuthService event of user logout,
        * then, destroy firebaseArray reference and cleanup
        * service notifications.
        */
        AuthService.$onLogout(function destroy() {
            firebaseArrayNotifications.$destroy();
            firebaseArrayNotifications = undefined;
        });
    });
})();