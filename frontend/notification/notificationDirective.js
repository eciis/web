   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state,
        $mdDialog, InstitutionService, UserService, RequestInvitationService, MessageService) {
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
                action: function (properties, notification, event) {
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
                action: function (properties, notification, event) {
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
                state: "process_request",
                action: function (properties, notification, event) {
                    return selectDialog(properties, notification, event);
                },
                properties: {
                    templateUrl: "app/requests/request_processing.html",
                    controller: "RequestProcessingController",
                    controllerAs: "requestCtrl",
                    locals: {}
                }
            },
            "REQUEST_INSTITUTION_CHILDREN": {
                icon: "account_balance",
                state: "process_request",
                action: function (properties, notification, event) {
                    return selectDialog(properties, notification, event);
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
                    return selectDialog(properties, notification, event);
                },
                properties: {
                    templateUrl: "app/requests/request_processing.html",
                    controller: "RequestProcessingController",
                    controllerAs: "requestCtrl",
                    locals: {}
                }
            },
            "REQUEST_INSTITUTION": {
                icon: "account_balance",
                state: "process_request",
                action: function (properties, notification, event) {
                    return selectDialog(properties, notification, event);
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
                action: function (properties, notification, event) {
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
                action: function(properties, notification, event) {
                    return selectDialog(properties, notification, event);
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
                action: function(properties, notification, event) {
                    return selectDialog(properties, notification, event);
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
            $state.go(state, {key: notification.entity.key});
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

        function showPendingReqDialog(dialogProperties, event) {
            $mdDialog.show({
                controller: dialogProperties.controller,
                controllerAs: dialogProperties.controllerAs,
                templateUrl: dialogProperties.templateUrl,
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: dialogProperties.locals,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        }

        function showResolvedReqDialog(event) {
            function ResolvedRequesCtrl($mdDialog) {
                var controll = this;
                controll.hide = function hide() {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                templateUrl: "app/requests/resolved_request_dialog.html",
                controller: ResolvedRequesCtrl,
                controllerAs: 'ctrl',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true
            });
        }

        function selectDialog(dialogProperties, notification, event) {
            var isStateProcessRequest = type_data[notification.entity_type].state == 'process_request';
            
            if(isStateProcessRequest) {
                loadRequest(notification.entity.key, notification.entity_type).then(
                    function success(response) {
                        var request = new Invite(response);
                        dialogProperties.locals.request = request;
                        var isRequestResolved = request.isStatusOn('rejected') || request.isStatusOn('accepted');
                        isRequestResolved ? showResolvedReqDialog(event) : showPendingReqDialog(dialogProperties, event);
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    }
                );
            } else {
                dialogProperties.locals.key = notification.entity.key;
                showPendingReqDialog(dialogProperties, event);
            }
        }

        function loadRequest(invitekey, entityType) {
            switch(entityType) {
                case 'REQUEST_USER':
                    return RequestInvitationService.getRequest(invitekey);
                case 'REQUEST_INSTITUTION':
                    return RequestInvitationService.getRequestInst(invitekey);
                case 'REQUEST_INSTITUTION_CHILDREN':
                    return RequestInvitationService.getInstChildrenRequest(invitekey);
                case 'REQUEST_INSTITUTION_PARENT':
                    return RequestInvitationService.getInstParentRequest(invitekey);
            } 
        }

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
        }

        function refreshUser(notification) {
            UserService.load().then(function success(response) {
                notificationCtrl.user.institutions = response.institutions;
                notificationCtrl.user.follows = response.follows;
                notificationCtrl.user.institution_profiles = response.institution_profiles;
                notificationCtrl.user.permissions = response.permissions;
                AuthService.save();
            });
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