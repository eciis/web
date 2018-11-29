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

    app.controller("RegisteredInstitutionController", function regInstCtrl(AuthService, 
        InstitutionService, MessageService, FEDERAL_STATE_ACRONYM, $state) {
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

        regInstCtrl.follow = function follow() {
            var promise = InstitutionService.follow(regInstCtrl.institution.key);
            promise.then(function success() {
                user.follow(regInstCtrl.institution);
                AuthService.save();
                MessageService.showToast("Seguindo " + regInstCtrl.institution.name);
            });
            return promise;
        };

        regInstCtrl.getFederalStateAcronym = function () {
            return FEDERAL_STATE_ACRONYM[regInstCtrl.institution.address.federal_state];
        };

        regInstCtrl.limitString = (string, size) => {
            return Utils.limitString(string, size);
        };

        regInstCtrl.getMaxInstNameSize = () => {
            return screen.width <= 320? 45: 70;
        };

        regInstCtrl.goToInst = () => {
            $state.go('app.institution.timeline', 
                { institutionKey: regInstCtrl.institution.key });
        };
    });
})();