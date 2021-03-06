"use strict";

(function(){
    var app = angular.module("app");
    app.constant('NOTIFICATION_TYPE', {
        COMMENT: {
            "icon": "comment",
            "state": "app.post"
        },
        DELETE_MEMBER: {
            "icon": "clear"
        },
        LEFT_INSTITUTION: {
            "icon": "clear"
        },
        DELETED_INSTITUTION: {
            "icon": "clear"
        },
        TRANSFER_ADM_PERMISSIONS: {
            "icon": "check_circle_outline"
        },
        POST: {
            "icon": "inbox",
            "state": "app.post"
        },
        SURVEY_POST: {
            "icon": "poll",
            "state": "app.post"
        },
        SHARED_POST: {
            "icon": "share",
            "state": "app.post"
        },
        INVITE: {
            "icon": "people",
            "state": "new_invite"
        },
        REMOVE_INSTITUTION_LINK: {
            "icon": "account_balance"
        },
        REPLY_COMMENT: {
            "icon": "reply",
            "state": "app.post"
        },
        LIKE_COMMENT: {
            "icon": "grade",
            "state": "app.post"
        },
        LIKE_POST: {
            "icon": "grade",
            "state": "app.post"
        },
        REQUEST_USER: {
            "icon": "person_add",
            "action": {"showDialog": true},
            "properties": {
                "templateUrl": "app/requests/request_user_dialog.html",
                "controller": "RequestProcessingController",
                "controllerAs": "requestCtrl",
                "locals": {}
            }
        },
        REQUEST_INSTITUTION_CHILDREN: {
            "icon": "account_balance",
            "action": {"showDialog": true},
        },
        REQUEST_INSTITUTION_PARENT: {
            "icon": "account_balance",
            "action": {"showDialog": true},
        },
        REQUEST_INSTITUTION: {
            "icon": "account_balance",
            "action": {"showDialog": true},
            "properties": {
                "templateUrl": "app/requests/request_institution_processing.html",
                "controller": "RequestProcessingController",
                "controllerAs": "requestCtrl",
                "locals": {}
            }
        },
        ACCEPT_INSTITUTION_LINK: {
            "icon": "account_balance"
        },
        ACCEPTED_LINK: {
            "icon": "link"
        },
        REJECTED_LINK: {
            "icon": "close"
        },
        REJECT_INSTITUTION_LINK: {
            "icon": "account_balance",
        },
        ACCEPT_INVITE_USER: {
            "icon": "person"
        },
        REJECT_INVITE_USER: {
            "icon": "person"
        },
        ACCEPT_INVITE_INSTITUTION: {
            "icon": "account_balance"
        },
        REJECT_INVITE_INSTITUTION: {
            "icon": "account_balance"
        },
        SHARED_EVENT: {
            "icon": "share",
            "state": "app.post"
        },
        DELETED_POST: {
            "icon": "clear"
        },
        USER_ADM: {
            "icon": "account_balance",
            "action": {"showDialog": true},
            "properties": {
                "templateUrl": "app/invites/process_invite_user_adm.html",
                "controller": "ProcessInviteUserAdmController",
                "controllerAs": "processCtrl",
                "locals": {
                    "typeOfDialog": "ACCEPT_INVITATION"
                }
            }
        },
        ACCEPT_INVITE_USER_ADM: {
            "icon": "account_balance",
            "action": {"showDialog": true},
            "properties": {
                "templateUrl": "app/invites/process_invite_user_adm.html",
                "controller": "ProcessInviteUserAdmController",
                "controllerAs": "processCtrl",
                "locals": {
                    "typeOfDialog": "VIEW_ACCEPTED_INVITATION_SENDER"
                }
            }
        },
        REJECT_INVITE_USER_ADM: {
            "icon": "account_balance"
        },
        ACCEPT_INVITE_HIERARCHY: {
            "icon": "account_balance"
        },
        DELETED_USER: {
            "icon": "clear"
        },
        ADD_ADM_PERMISSIONS: {
            "icon": "check_circle_outline"
        },
        USER_INVITES_SENT: {
            "icon": "people"
        },
        RE_ADD_ADM_PERMISSIONS: {
            "icon": "check_circle_outline"
        },
        DELETED_EVENT: {
            "icon": "delete"
        },
        UPDATED_EVENT: {
            "icon": "autorenew"
        }
    })
})()