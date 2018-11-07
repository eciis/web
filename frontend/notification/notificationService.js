'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray, AuthService, $rootScope,
        NotificationMessageCreatorService) {
        var service = this;

        var ref = firebase.database().ref();

        service.user = AuthService.getCurrentUser();
        service.firebaseArrayNotifications;
        service.unreadNotifications = [];

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
            var message = NotificationMessageCreatorService.assembleMessage(entity_type, mainInst, otherInst);
            return message;
        };

        service.watchNotifications = function watchNotifications(userKey) {
            setupNotifications(userKey, function() {
                _.forEach(service.firebaseArrayNotifications, function each(notification) {
                    if (isNew(notification)) {
                        service.unreadNotifications.push(notification);
                    }
                });

                service.firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = service.firebaseArrayNotifications.$getRecord(ev.key);
                        service.unreadNotifications.push(notification);
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

        function markAsRead(notification) {
            notification.status = "READ";
            return service.firebaseArrayNotifications.$save(notification);
        };


        service.markAsRead = function(notification) {
            markAsRead(notification);
            _.remove(service.unreadNotifications, function find(found) {
                return found.$id === notification.$id;
            })
        };

        service.markAllAsRead = function markAllAsRead() {
            var promises = service.unreadNotifications.map(function(obj){
                return markAsRead(obj);
            });
            Promise.all(promises).then(function() {
                Utils.clearArray(service.unreadNotifications);
            });
        };

        service.getAllNotifications = function getAllNotifications() {
            return service.firebaseArrayNotifications;
        };

        service.getUnreadNotifications = function getUnreadNotifications(){
            return service.unreadNotifications;
        }

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

        (function main(){
            service.watchNotifications(service.user.key);
        })();
    });
})();