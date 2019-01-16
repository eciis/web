"use strict";

(function() {
    const app = angular.module("app");

    function ListUsersController(ProfileService) {
        const listUsersCtrl = this;

        listUsersCtrl.keyword = "";

        listUsersCtrl.getInitialLetterOfName = (user) => Utils.getInitialLetterOfName(user);

        listUsersCtrl.showUserProfile = (userKey, ev) => ProfileService.showProfile(userKey, ev);

        listUsersCtrl.limitString = (string, limit) => Utils.limitString(string, limit);
    };

    app.component("listUsers", {
        templateUrl: 'app/institution/list_users.html',
        controller: ['ProfileService', ListUsersController],
        controllerAs: 'listUsersCtrl',
        bindings: {
            pageLabel: '=',
            users: '='
        }
    });
})();