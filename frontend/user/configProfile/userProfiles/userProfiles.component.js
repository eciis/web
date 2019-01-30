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

    function userProfileController(AuthService) {
        const userProfileCtrl = this;

        // userProfileCtrl.user = AuthService.getCurrentUser();

        userProfileCtrl.getImage = profile => {
            const editImagePath = 'app/images/edit.png';
            return userProfileCtrl.editMode ? editImagePath : profile.institution.photo_url;
        }

        userProfileCtrl.edit = profile => {
            if(userProfileCtrl.editMode) {
                console.log('edit');
            }
            
        };

    }
})();