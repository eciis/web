'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray,  MessageService, AuthService, $rootScope) {
        var service = this;

        var ref = firebase.database().ref();

        var firebaseArrayNotifications;

        var MESSAGE_ASSEMBLERS = {
            'COMMENT': messageCreator('Comentou em um post de '),
            'POST': messageCreator('Publicou um novo post de '),
            'SURVEY_POST': messageCreator('Publicou uma nova enquete de '),
            'SHARED_POST': messageCreator('Compartilhou um post de '),
            'INVITE': messageCreator('Te enviou um novo convite via '),
            'INSTITUTION': messageCreator('Removeu a conexão entre '),
            'DELETED_INSTITUTION': messageCreator('Removeu '),
            'REQUEST_USER': messageCreator('Solicitou ser membro de '),
            'REQUEST_INSTITUTION_PARENT': messageCreator('Solicitou um novo vínculo entre '),
            'REQUEST_INSTITUTION_CHILDREN': messageCreator('Solicitou um novo vínculo entre '),
            'REQUEST_INSTITUTION': messageCreator('Deseja criar uma nova institutição'),
            'REPLY_COMMENT': messageCreator('Respondeu ao seu comentário no post de '),
            'LIKE_COMMENT': messageCreator('Curtiu seu comentário no post de '),
            'LIKE_POST': messageCreator('Curtiu um post de '),
            'REJECT_INSTITUTION_LINK': messageCreator('Rejeitou sua solicitação de vínculo entre '),
            'ACCEPT_INSTITUTION_LINK': messageCreator('Aceitou sua solicitação de vínculo entre '),
            'REJECT_INVITE_USER': messageCreator('Rejeitou o convite para ser membro de '),
            'ACCEPT_INVITE_USER': messageCreator('Aceitou o convite para ser membro de '),
            'REJECT_INVITE_INSTITUTION': messageCreator('Rejeitou o seu convite para ser administrador'),
            'ACCEPT_INVITE_INSTITUTION': messageCreator('Aceitou o seu convite para ser administrador'),
            'DELETE_MEMBER': messageCreator('Removeu você de '),
            'ACCEPTED_LINK': messageCreator('Aceitou sua solicitação de vínculo a ')
        };

        var POST_NOTIFICATION = 'POST';
        var CHILD_ADDED = "child_added";

        service.formatMessage = function formatMessage(notification) {
            var entity_type = notification.entity_type;
            var mainInst = notification.entity.institution_name;
            var otherInst = notification.from.institution_name;
            var message = assembleMessage(entity_type, mainInst, otherInst);
            return message;
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
                            $rootScope.$emit(notification.entity_type);
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
                        if (notification.entity_type === POST_NOTIFICATION) {
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

        function assembleMessage(entity_type, mainInst, otherInst) {
            var assembler = MESSAGE_ASSEMBLERS[entity_type];
            return assembler(mainInst, otherInst);
        }

        function messageCreator(message) {
            return function (mainInst, otherInst) {
                if(mainInst && otherInst) {
                    message = message + `${mainInst} e ${otherInst}`;
                    return Utils.limitString(message, 50);
                } else if(mainInst) {
                    return Utils.limitString(message + mainInst, 50);
                } else {
                    return message;
                }
            };            
        }

        /**
        * Start watch AuthService event of user logout,
        * then, destroy firebaseArray reference and cleanup
        * service notifications.
        */
        AuthService.$onLogout(function destroy() {
            if(firebaseArrayNotifications) {
                firebaseArrayNotifications.$destroy();
                firebaseArrayNotifications = undefined;
            }
        });
    });
})();