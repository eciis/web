"use strict";

(function () {
    const app = angular.module("app");

    app.component("registeredInstitution", {
        templateUrl: "/app/institution/institution_header.html",
        bindings: {
            institution: '='
        },
        controller: function($state, STATE){
            const ctrl = this;

            ctrl.inInstitutionTimeline = function inInstitutionTimeline(){
                return $state.current.name === STATE.INST_TIMELINE;
            }

            ctrl.inRegistrationData = function inRegistrationData(){
                return $state.current.name === STATE.INST_REGISTRATION_DATA;
            }
        },
        controllerAs: "instHeaderCtrl"
    });
})();