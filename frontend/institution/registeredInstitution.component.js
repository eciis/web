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
        
        /**
         * Basically checks if the institution has a coverPhoto.
         */
        regInstCtrl.hasCoverPhoto = function hasCoverPhoto() {
            return regInstCtrl.institution.cover_photo;
        };

        /**
         * Checks if the user is following the institution tied to the controller
         */
        regInstCtrl.userIsFollowing = function userIsFollowing() {
            return user.follows.find(inst => { return inst.key === regInstCtrl.institution.key});
        };

        /**
         * Follows the institution
         */
        regInstCtrl.follow = function follow() {
            var promise = InstitutionService.follow(regInstCtrl.institution.key);
            promise.then(function success() {
                user.follow(regInstCtrl.institution);
                AuthService.save();
                MessageService.showToast("Seguindo " + regInstCtrl.institution.name);
            });
            return promise;
        };

        /**
         * Gets the acronym of the institution's federal_state
         * using FEDERAL_STATE_ACRONYM constant
         */
        regInstCtrl.getFederalStateAcronym = function () {
            return FEDERAL_STATE_ACRONYM[regInstCtrl.institution.address.federal_state];
        };

        /**
         * Crops a string if it is longer than size
         */
        regInstCtrl.limitString = (string, size) => {
            return Utils.limitString(string, size);
        };

        /**
         * Returns the maximum size of the inst name
         * according to the screen size.
         * It can not be tested once it depends of the screen width
         */
        regInstCtrl.getMaxInstNameSize = () => {
            return screen.width <= 320? 45: 70;
        };

        /**
         * Redirect the user to the institution's page
         */
        regInstCtrl.goToInst = () => {
            $state.go('app.institution.timeline', 
                { institutionKey: regInstCtrl.institution.key });
        };
    });
})();