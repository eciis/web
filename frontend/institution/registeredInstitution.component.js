"use strict";

(function () {
    const app = angular.module("app");

    app.component("registeredInstitution", {
        templateUrl: "/app/institution/registered_institution.html",
        controller: "RegisteredInstitutionController",
        controllerAs: "regInstCtrl",
        bindings: {
            institution: '=',
            user: '='
        }
    });

    app.controller("RegisteredInstitutionController", function regInstCtrl(AuthService, 
        InstitutionService, MessageService, FEDERAL_STATE_ACRONYM, $state, STATES) {
        const regInstCtrl = this;
        
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
            return regInstCtrl.user.follows.find(inst => { return inst.key === regInstCtrl.institution.key});
        };

        /**
         * Follows the institution
         */
        regInstCtrl.follow = function follow() {
            return InstitutionService.follow(regInstCtrl.institution.key)
            .then(function success() {
                regInstCtrl.user.follow(regInstCtrl.institution);
                AuthService.save();
                MessageService.showToast("Seguindo " + regInstCtrl.institution.name);
            });
        };

        /**
         * Gets the acronym of the institution's federal_state
         * using FEDERAL_STATE_ACRONYM constant
         */
        regInstCtrl.getFederalStateAcronym = function () {
            return FEDERAL_STATE_ACRONYM[_.get(regInstCtrl.institution, 'address.federal_state')];
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
         * It can not be tested once it depends on the screen width
         */
        regInstCtrl.getMaxInstNameSize = () => {
            return screen.width <= 320? 45: 70;
        };

        /**
         * Redirect the user to the institution's page
         */
        regInstCtrl.goToInst = () => {
            $state.go(STATES.INST_TIMELINE, 
                { institutionKey: regInstCtrl.institution.key || regInstCtrl.institution.id });
        };

        /**
         * Check if the last time the user saw the registered institutions
         * was after the current institution's creation.
         */
        regInstCtrl.hasSeenInstitution = function hasSeenInstitution() {
            return regInstCtrl.user.last_seen_institutions && regInstCtrl.user.last_seen_institutions > regInstCtrl.institution.creation_date;
        };

        regInstCtrl.$onInit = () => {
            const address = regInstCtrl.institution.address;
            if (_.isString(address)) {
                regInstCtrl.institution.address = JSON.parse(address);
            }
        };
    });
})();