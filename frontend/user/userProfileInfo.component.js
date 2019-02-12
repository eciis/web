"use strict";

(function() {

    function UserProfileInfo() {
        const userProfileInfoCtrl = this;
        
        userProfileInfoCtrl.showProperty = (property, limit) => {
            const prop = Utils.showProperty(property);
            return Utils.limitString(prop, limit);
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