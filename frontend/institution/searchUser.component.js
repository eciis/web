"use strict";

(function() {
    angular
    .module("app")
    .component("searchUser", {
        templateUrl: 'app/institution/search_user.html',
        controller: SearchUserCtrl,
        controllerAs: 'searchUserCtrl',
        bindings: {
            keyword: '='
        }
    });

    function SearchUserCtrl() {
        const searchUserCtrl = this;
        searchUserCtrl.keyword = "";
    }
})();