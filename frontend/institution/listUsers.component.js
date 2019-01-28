"use strict";

(function() {

    function ListUsersController(ProfileService) {
        const listUsersCtrl = this;

        listUsersCtrl.keyword = "";

        listUsersCtrl.getInitialLetterOfName = (user) => Utils.getInitialLetterOfName(user);

        listUsersCtrl.showUserProfile = (userKey, ev) => ProfileService.showProfile(userKey, ev, listUsersCtrl.currentInst);

        listUsersCtrl.limitString = (string, limit) => Utils.limitString(string, limit);
    };

     angular
    .module("app")
    .component("listUsers", {
        templateUrl: 'app/institution/list_users.html',
        controller: ['ProfileService', ListUsersController],
        controllerAs: 'listUsersCtrl',
        bindings: {
            pageLabel: '@',
            currentInst: '@',
            users: '<'
        }
    });
})();