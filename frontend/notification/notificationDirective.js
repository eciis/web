   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state, $mdDialog) {
        var controller = this;

        controller.user = AuthService.getCurrentUser();

        controller.notifications = [];

        var type_data = {
            "COMMENT": {
                icon: "comment",
                state: "app.post"
            },
            "DELETE_MEMBER": {
                icon: "clear"
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
               isDialog: true,
               dialogProperties: {
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
                isDialog: true,
                dialogProperties: {
                     templateUrl: "app/requests/request_processing.html",
                     controller: "RequestProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {}
                }
            },
            "REQUEST_INSTITUTION_PARENT": {
                icon: "account_balance",
                state: "process_request",
                isDialog: true,
                dialogProperties: {
                     templateUrl: "app/requests/request_processing.html",
                     controller: "RequestProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {}
                }
            },
            "ACCEPT_INSTITUTION_LINK": {
                icon: "account_balance",
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
                isDialog: true,
                dialogProperties: {
                     templateUrl: "app/requests/request_institution_processing.html",
                     controller: "RequestInstitutionProcessingController",
                     controllerAs: "requestCtrl",
                     locals: {
                         key: ""
                     }
                }
            }
        };

        controller.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(controller.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        controller.getIcon = function getIcon(type) {
            var icon = type_data[type].icon;
            return icon;
        };

        controller.goTo = function goTo(notification) {
            if(notification.type !== 'INSTITUTION') {
                var state = type_data[notification.type].state;
                $state.go(state, {key: notification.entity_key});
            }
        };

        controller.action = function action(notification) {
            var notificationProperties = type_data[notification.type];

            if (notificationProperties.isDialog) {
                notificationProperties.dialogProperties.locals.key = notification.entity_key;
                controller.showDialog(notificationProperties.dialogProperties);
            } else {
                controller.goTo(notification);
            }

            controller.markAsRead(notification);
        };

        controller.showDialog = function showDialog(dialogProperties) {
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
        };

        controller.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        controller.clearAll = function clearAll() {
            _.forEach(controller.notifications, function(notification) {
                controller.markAsRead(notification);
            });
        };

        (function main() {
            NotificationService.watchNotifications(controller.user.key, controller.notifications);
        })();
    });

    app.directive("notification", function() {
        return {
            restrict: 'E',
            templateUrl: "app/notification/notifications.html",
            controllerAs: "controller",
            controller: "NotificationController"
        };
    });
})();