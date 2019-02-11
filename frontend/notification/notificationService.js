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
            console.log(notification);
            var message = NotificationMessageCreatorService.assembleMessage(entity_type, mainInst, otherInst, notification.title);
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

        /** Modify status of notification to 'READ' and save in array of notification
         * @param {Notification} notification The notification that was READ
         */
        function markAsRead(notification) {
            notification.status = "READ";
            return service.firebaseArrayNotifications.$save(notification);
        };

        /** Change status of notification to READ and remove of unreadNotifications array.
         * @param {Notification} notification Tha notification that was READ.
         */
        service.markAsRead = function(notification) {
            markAsRead(notification);
            _.remove(service.unreadNotifications, function find(found) {
                return found.$id === notification.$id;
            })
        };

        /** Mark all unreadNotification to READ.
         */
        service.markAllAsRead = function markAllAsRead() {
            const promises = service.unreadNotifications.map(function(notification){
                return markAsRead(notification);
            });
            return Promise.all(promises).then(function() {
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