"use strict";

(function() {
    angular
    .module("app")
    .component("userProfiles", {
        templateUrl: 'app/user/userProfiles/user_profiles.html',
        controller: userProfileController,
        controllerAs: 'userProfileCtrl',
        bindings: {
            profiles: '<',
            editMode: '<',
            onClick: '<'
        }
    })

    function userProfileController($mdDialog) {
        const userProfileCtrl = this;

        userProfileCtrl.getImage = profile => {
            const editImagePath = 'app/images/edit.png';
            return userProfileCtrl.editMode ? editImagePath : profile.institution.photo_url;
        }

        userProfileCtrl.edit = (profile, event) => {
            if(userProfileCtrl.editMode) userProfileCtrl.onClick(profile, event);
        };
    }

    
})();