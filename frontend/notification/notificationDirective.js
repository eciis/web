   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state,
        UserService, RequestDialogService) {
        var notificationCtrl = this;

        notificationCtrl.user = AuthService.getCurrentUser();

        notificationCtrl.notifications = [];
        notificationCtrl.allNotifications = [];

        var type_data = {
            "COMMENT": {
                icon: "comment",
                state: "app.post"
            },
            "DELETE_MEMBER": {
                icon: "clear",
                action: function (notification, event, properties) {
                    if (notification.status !== 'READ') {
                        return refreshUser(notification);
                    }
                }
            },
            "LEFT_INSTITUTION": {
                icon: "clear"
            },
            "DELETED_INSTITUTION": {
                icon: "clear",
                action: function (notification, event, properties) {
                    if (notification.status !== 'READ') {
                        return refreshUser(notification);
                    }
                }
            },
            "POST": {
                icon: "inbox",
                state: "app.post"
            },
            "SURVEY_POST": {
                icon: "poll",
                state: "app.post"
            },
            "SHARED_POST": {
                icon: "share",
                state: "app.post"
            },
            "INVITE": {
                icon: "people",
                state: "new_invite"
            },
            "REMOVE_INSTITUTION_LINK": {
                icon: "account_balance"
            },
            "REPLY_COMMENT": {
                icon: "reply",
                state: "app.post"
            },
            "LIKE_COMMENT": {
                icon: "grade",
                state: "app.post"
            },
            "LIKE_POST": {
                icon: "grade",
                state: "app.post"
            },
            "REQUEST_USER": {
                icon: "person_add",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                },
                properties: {
                    templateUrl: "app/requests/request_user_dialog.html",
                    controller: "RequestProcessingController",
                    controllerAs: "requestCtrl",
                    locals: {}
                }
            },
            "REQUEST_INSTITUTION_CHILDREN": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                }
            },
            "REQUEST_INSTITUTION_PARENT": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                }
            },
            "REQUEST_INSTITUTION": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                },
                properties: {
                    templateUrl: "app/requests/request_institution_processing.html",
                    controller: "RequestProcessingController",
                    controllerAs: "requestCtrl",
                    locals: {}
                }
            },
            "ACCEPT_INSTITUTION_LINK": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    if (notification.status !== 'READ') {
                        return refreshUser(notification);
                    }
                }
            },
            "ACCEPTED_LINK": {
                icon: "link"
            },
            "REJECTED_LINK": {
                icon: "close"
            },
            "REJECT_INSTITUTION_LINK": {
                icon: "account_balance",
            },
            "ACCEPT_INVITE_USER": {
                icon: "person"
            },
            "REJECT_INVITE_USER": {
                icon: "person"
            },
            "ACCEPT_INVITE_INSTITUTION": {
                icon: "account_balance"
            },
            "REJECT_INVITE_INSTITUTION": {
                icon: "account_balance"
            },
            "SHARED_EVENT": {
                icon: "share",
                state: "app.post"
            },
            'DELETED_POST': {
                icon: "clear"
            },
            "REPLY_COMMENT": {
                icon: "comment",
                state: "app.post"
            },
            "USER_ADM": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                },
                properties: {
                    templateUrl: "app/invites/process_invite_user_adm.html",
                    controller: "ProcessInviteUserAdmController",
                    controllerAs: "processCtrl",
                    locals: {
                        typeOfDialog: 'ACCEPT_INVITATION'
                    }
                }
            },
            "ACCEPT_INVITE_USER_ADM": {
                icon: "account_balance",
                action: function (notification, event, properties) {
                    return showRequestDialog(notification, event, properties);
                },
                properties: {
                    templateUrl: "app/invites/process_invite_user_adm.html",
                    controller: "ProcessInviteUserAdmController",
                    controllerAs: "processCtrl",
                    locals: {
                        typeOfDialog: 'VIEW_ACCEPTED_INVITATION_SENDER'
                    }
                }
            },
            "REJECT_INVITE_USER_ADM": {
                icon: "account_balance"
            },
            "ACCEPT_INVITE_HIERARCHY": {
                icon: "account_balance",
            },
        };

        notificationCtrl.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(notificationCtrl.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        notificationCtrl.getIcon = function getIcon(type) {
            var icon = type_data[type].icon;
            return icon;
        };

        notificationCtrl.goTo = function goTo(notification) {
            var state = type_data[notification.entity_type].state;
            if(state) {
                $state.go(state, {key: notification.entity.key});
            } else {
                notificationCtrl.seeAll();
            }
        };

        notificationCtrl.action = function action(notification, event) {
            var properties = type_data[notification.entity_type].properties;
            var action = type_data[notification.entity_type].action;
            if (action){
                action(notification, event, properties);
            } else {
                notificationCtrl.goTo(notification);
            }

            notificationCtrl.markAsRead(notification);
        };

        notificationCtrl.showNotifications = function showNotifications($mdMenu, $event) {
            var hasUnreadNotifications = notificationCtrl.notifications.length > 0;
            hasUnreadNotifications ? $mdMenu.open($event) : notificationCtrl.seeAll();
        };

        notificationCtrl.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        notificationCtrl.clearAll = function clearAll() {
            _.forEach(notificationCtrl.notifications, function(notification) {
                notificationCtrl.markAsRead(notification);
            });
        };

        notificationCtrl.numberUnreadNotifications = function numberUnreadNotifications() {
            return notificationCtrl.notifications.length < 100 ?
                    notificationCtrl.notifications.length : "+99";
        };

        notificationCtrl.limitString = function limitString(string, value) {
            return Utils.limitString(string, value);
        };

        notificationCtrl.seeAll = function seeAll() {
            $state.go('app.user.notifications');
        };

        function refreshUser() {
            UserService.load().then(function success(response) {
                notificationCtrl.user.institutions = response.institutions;
                notificationCtrl.user.follows = response.follows;
                notificationCtrl.user.institution_profiles = response.institution_profiles;
                notificationCtrl.user.permissions = response.permissions;
                AuthService.save();
            });
        }

        function showRequestDialog(notification, event, properties) {
            RequestDialogService.showRequestDialog(notification, event, properties);
        }

        (function main() {
            NotificationService.watchNotifications(notificationCtrl.user.key, notificationCtrl.notifications);
            notificationCtrl.allNotifications = NotificationService.getAllNotifications();
        })();
    });

    app.directive("notification", function() {
        return {
            restrict: 'E',
            templateUrl: "app/notification/notifications.html",
            controllerAs: "notificationCtrl",
            controller: "NotificationController"
        };
    });
})();