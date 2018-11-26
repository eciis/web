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

    app.controller("RegisteredInstitutionController", function regInstCtrl() {
        const regInstCtrl = this;

        regInstCtrl.hasCoverPhoto = function hasCoverPhoto() {
            return regInstCtrl.institution.cover_photo;
        };

        console.log(regInstCtrl.institution);
    });
})();