   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state,
        $mdDialog, InstitutionService, UserService) {
        var notificationCtrl = this;

        notificationCtrl.user = AuthService.getCurrentUser();

        notificationCtrl.notifications = [];

        var type_data = {
            "COMMENT": {
                icon: "comment",
                state: "app.post"
            },
            "DELETE_MEMBER": {
                icon: "clear",
                action: function() {
                    return refreshUserInstitutions();
                }
            },
            "DELETED_INSTITUTION": {
                icon: "clear",
                action: function() {
                    return refreshUserInstitutions();
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
            "INSTITUTION": {
                icon: "account_balance",
                state: "app.post"
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
               state: "process_request",
               action: function (properties, notification, event) {
                    return showDialog(properties, notification, event);
                },
               properties: {
                    templateUrl: "app/requests/request_processing.html",
                    controller: "RequestProcessingController",
                    controllerAs: "requestCtrl",
                    locals: {
                        key: ""
                    }
               }
            },
            "REQUEST_INSTITUTION_CHILDREN": {
                icon: "account_balance",
                state: "process_request",
                action: function (properties, notification, event) {
                    return showDialog(properties, notification, event);
                },
                properties: {
                     templateUrl: "app/requests/request_processing.html",
                     controller: "RequestProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {}
                }
            },
            "REQUEST_INSTITUTION_PARENT": {
                icon: "account_balance",
                state: "process_request",
                action: function (properties, notification, event) {
                    return showDialog(properties, notification, event);
                },
                properties: {
                     templateUrl: "app/requests/request_processing.html",
                     controller: "RequestProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {}
                }
            },
            "ACCEPT_INSTITUTION_LINK": {
                icon: "account_balance",
            },
            "ACCEPTED_LINK": {
                icon: "link"
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
            "REQUEST_INSTITUTION": {
                icon: "account_balance",
                state: "process_request",
                action: function (properties, notification, event) {
                    return showDialog(properties, notification, event);
                },
                properties: {
                     templateUrl: "app/requests/request_institution_processing.html",
                     controller: "RequestInstitutionProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {
                         key: ""
                     }
                }
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
            }
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
            if(notification.entity_type !== 'INSTITUTION') {
                var state = type_data[notification.entity_type].state;
                $state.go(state, {key: notification.entity.key});
            }
        };

        notificationCtrl.action = function action(notification, event) {
            var notificationProperties = type_data[notification.entity_type].properties;
            var  notificationAction = type_data[notification.entity_type].action;
            if (notificationAction){
                notificationAction(notificationProperties, notification, event);
            } else {
                notificationCtrl.goTo(notification);
            }

            notificationCtrl.markAsRead(notification);
        };

        function showDialog(dialogProperties, notification, event) {
            dialogProperties.locals.key = notification.entity.key;
            $mdDialog.show({
                controller: dialogProperties.controller,
                controllerAs: dialogProperties.controllerAs,
                templateUrl: dialogProperties.templateUrl ,
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: dialogProperties.locals,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        }

        notificationCtrl.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        notificationCtrl.clearAll = function clearAll() {
            _.forEach(notificationCtrl.notifications, function(notification) {
                notificationCtrl.markAsRead(notification);
            });
        };

        notificationCtrl.number_of_notifications = function number_of_notifications() {
            return notificationCtrl.notifications.length < 100 ?
                    notificationCtrl.notifications.length : "+99";
        };

        notificationCtrl.limitString = function limitString(string, value) {
            return Utils.limitString(string, value);
        };

        notificationCtrl.seeAll = function seeAll() {
            $state.go('app.user.notifications');
        }

        function refreshUserInstitutions () {
            UserService.load().then(function success(response) {
                notificationCtrl.user.institutions = response.institutions;
                notificationCtrl.user.follows = response.follows;
                notificationCtrl.user.institution_profiles = response.institution_profiles;
                if(!_.isEmpty(notificationCtrl.user.institutions)) {
                    notificationCtrl.user.changeInstitution();
                }
                AuthService.save();
            });
        }

        (function main() {
            NotificationService.watchNotifications(notificationCtrl.user.key, notificationCtrl.notifications);
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