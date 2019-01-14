"use strict";

(function() {
    angular
    .module("app")
    .component("listUsers", {
        templateUrl: 'app/institution/list_users.html',
        controller: ListUsersCtrl,
        controllerAs: 'listUsersCtrl',
        bindings: {
            pageLabel: '=',
            users: '='
        }
    });

    function ListUsersCtrl(ProfileService) {
        const listUsersCtrl = this;
        listUsersCtrl.keyword = "";

        listUsersCtrl.getInitialLetterOfName = (user) => {
            return Utils.getInitialLetterOfName(user);
        };

        listUsersCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        listUsersCtrl.limitString = (string, limit) => {
            return Utils.limitString(string, limit);
        };
    }
})();