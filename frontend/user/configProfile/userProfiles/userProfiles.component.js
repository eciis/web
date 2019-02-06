"use strict";

(function() {
    angular
    .module("app")
    .component("userProfiles", {
        templateUrl: 'app/user/configProfile/userProfiles/user_profiles.html',
        controller: userProfileController,
        controllerAs: 'userProfileCtrl',
        bindings: {
            profiles: '<',
            editMode: '<'
        }
    })

    function userProfileController($mdDialog) {
        const userProfileCtrl = this;

        userProfileCtrl.getImage = profile => {
            const editImagePath = 'app/images/edit.png';
            return userProfileCtrl.editMode ? editImagePath : profile.institution.photo_url;
        }

        userProfileCtrl.openEditDialog = (profile, event) => {
            const dialogData = {
                templateUrl: 'app/user/edit_profile.html',
                controller: 'EditProfileController',
                controllerAs: "editProfileCtrl",
                locals: { profile },
                targetEvent: event,
                clickOutsideToClose: false
            };
            if(userProfileCtrl.editMode) $mdDialog.show(dialogData);
        };
    }

    
})();