"use strict";

(function() {

    function UserProfileInfo() {
        const userProfileInfoCtrl = this;
        
        userProfileInfoCtrl.showProperty = (property, limit) => {
            return Utils.limitString(property, limit) || 'Não informado';
        };
    };

     angular
    .module("app")
    .component("userProfileInfo", {
        templateUrl: 'app/user/user_profile_info.html',
        controller: [UserProfileInfo],
        controllerAs: 'userProfileInfoCtrl',
        bindings: {
            office: '<',
            phone: '<',
            email: '<'
        }
    });
})();