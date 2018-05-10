'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray,  MessageService, AuthService, $rootScope) {
        var service = this;

        var ref = firebase.database().ref();

        service.firebaseArrayNotifications;

        /** Types of notification based on 
         *  the number of institutions mentioned on it **/
        var NO_INST = 'no_institution';
        var SINGLE_INST = 'single_institution';
        var DOUBLE_INST = 'double_institutions';

        var MESSAGE_ASSEMBLERS = {
            'COMMENT': messageCreator('Comentou em um post de ', SINGLE_INST),
            'POST': messageCreator('Publicou um novo post de ', SINGLE_INST),
            'SURVEY_POST': messageCreator('Publicou uma nova enquete de ', SINGLE_INST),
            'SHARED_POST': messageCreator('Compartilhou um post de ', SINGLE_INST),
            'INVITE': messageCreator('Te enviou um novo convite via ', SINGLE_INST),
            'REMOVE_INSTITUTION_LINK': messageCreator('Removeu a conexão entre ', DOUBLE_INST),
            'DELETED_INSTITUTION': messageCreator('Removeu ', SINGLE_INST),
            'REQUEST_USER': messageCreator('Solicitou ser membro de ', SINGLE_INST),
            'REQUEST_INSTITUTION_PARENT': messageCreator('Solicitou um novo vínculo entre ', DOUBLE_INST),
            'REQUEST_INSTITUTION_CHILDREN': messageCreator('Solicitou um novo vínculo entre ', DOUBLE_INST),
            'REQUEST_INSTITUTION': messageCreator('Deseja criar uma nova institutição', NO_INST),
            'REPLY_COMMENT': messageCreator('Respondeu ao seu comentário no post de ', SINGLE_INST),
            'LIKE_COMMENT': messageCreator('Curtiu seu comentário no post de ', SINGLE_INST),
            'LIKE_POST': messageCreator('Curtiu um post de ', SINGLE_INST),
            'REJECT_INSTITUTION_LINK': messageCreator('Rejeitou sua solicitação de vínculo entre ', DOUBLE_INST),
            'ACCEPT_INSTITUTION_LINK': messageCreator('Aceitou sua solicitação de vínculo entre ', DOUBLE_INST),
            'REJECT_INVITE_USER': messageCreator('Rejeitou o convite para ser membro de ', SINGLE_INST),
            'ACCEPT_INVITE_USER': messageCreator('Aceitou o convite para ser membro de ', SINGLE_INST),
            'REJECT_INVITE_INSTITUTION': messageCreator('Rejeitou o seu convite para ser administrador', NO_INST),
            'ACCEPT_INVITE_INSTITUTION': messageCreator('Aceitou o seu convite para ser administrador', NO_INST),
            'DELETE_MEMBER': messageCreator('Removeu você de ', SINGLE_INST),
            'ACCEPTED_LINK': messageCreator('Aceitou sua solicitação de vínculo com ', SINGLE_INST),
            'REJECTED_LINK': messageCreator('Rejeitou sua solicitação de vínculo com ', SINGLE_INST),
            'SHARED_EVENT': messageCreator('Compartilhou um evento de ', SINGLE_INST),
            'DELETED_POST': messageCreator('Deletou o seu post em ', SINGLE_INST),
            'USER_ADM': messageCreator('Indicou você para ser administrador da instituição ', SINGLE_INST),
            'ACCEPT_INVITE_USER_ADM': messageCreator('Aceitou seu convite para ser administrador de ', SINGLE_INST),
            'REJECT_INVITE_USER_ADM': messageCreator('Rejeitou seu convite para ser administrador de ', SINGLE_INST),
            'ACCEPT_INVITE_HIERARCHY': messageCreator('Aceitou seu convite e estabeleceu vínculo entre ', DOUBLE_INST)
        };

        var POST_NOTIFICATION = 'POST';
        var CHILD_ADDED = "child_added";

        service.formatMessage = function formatMessage(notification) {
            var entity_type = notification.entity_type;
            var mainInst = notification.entity.institution_name || notification.from.institution_name;
            /**
             * notification.to belongs to the new notification architecture.
             * notification.from belongs to old architecture.
             * DATE: 10/05/2018
             */
            var otherInst = (notification.to && notification.to.institution_name) || notification.from.institution_name;
            var message = assembleMessage(entity_type, mainInst, otherInst);
            return message;
        };

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            setupNotifications(userKey, function() {
                _.forEach(service.firebaseArrayNotifications, function each(notification) {
                    if (isNew(notification)) {
                        notificationsList.push(notification);
                    }
                });

                service.firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = service.firebaseArrayNotifications.$getRecord(ev.key);
                        notificationsList.push(notification);
                        if (isNew(notification)) {
                            $rootScope.$emit(notification.entity_type, notification.entity);
                        }
                    }
                });
            });
        };

        service.watchPostNotification = function watchPostNotification(userKey, callback) {
            setupNotifications(userKey, function() {
                service.firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = service.firebaseArrayNotifications.$getRecord(ev.key);
                        if (notification.entity_type === POST_NOTIFICATION) {
                            callback();
                        }
                    }
                });
            });
        };

        service.markAsRead = function markAsRead(notification) {
            notification.status = "READ";
            return service.firebaseArrayNotifications.$save(notification);
        };

        service.getAllNotifications = function getAllNotifications() {
            return service.firebaseArrayNotifications;
        };

        function setupNotifications(userKey, callback) {
            if (!service.firebaseArrayNotifications) {
                var notificationsRef = ref.child("notifications/"+userKey);
                service.firebaseArrayNotifications = $firebaseArray(notificationsRef);
            }
            service.firebaseArrayNotifications.$loaded().then(function() {
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

        function messageCreator(message, notificationType) {
            return function (mainInst, otherInst) {
                switch(notificationType) {
                    case DOUBLE_INST: 
                        return message + `${mainInst} e ${otherInst}`; 
                    case SINGLE_INST:
                        return message + (mainInst || otherInst); 
                    default:
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
            if(service.firebaseArrayNotifications) {
                service.firebaseArrayNotifications.$destroy();
                service.firebaseArrayNotifications = undefined;
            }
        });
    });
})();