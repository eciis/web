"use strict";

(function () {
    const app = angular.module("app");

    app.component("registeredInstitution", {
        templateUrl: "/app/institution/registered_institution.html",
        controller: "RegisteredInstitutionController",
        controllerAs: "regInstCtrl",
        bindings: {
            institution: '='
        }
    });

    app.controller("RegisteredInstitutionController", function regInstCtrl(AuthService) {
        const regInstCtrl = this;

        const user = AuthService.getCurrentUser();

        regInstCtrl.hasCoverPhoto = function hasCoverPhoto() {
            return regInstCtrl.institution.cover_photo;
        };

        regInstCtrl.userIsFollowing = function userIsFollowing() {
            let isFollowing = false;
            
            user.follows.forEach(inst => {
                if(regInstCtrl.institution.key === inst.key) {
                    isFollowing = true;
                }
            });

            return isFollowing;
        };

        console.log(regInstCtrl.institution);
    });
})();