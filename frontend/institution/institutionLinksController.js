'use strict';

(function () {
    const app = angular.module("app");
    
    app.controller("InstitutionLinksController", function InstitutionLinksController($state, InstitutionService, STATES) {

        var instLinksCtrl = this;
        var currentInstitutionKey = $state.params.institutionKey;

        instLinksCtrl.isLoadingInsts = true;
        instLinksCtrl.currentInstitution = "";
        instLinksCtrl.parentInstitution = {};
        instLinksCtrl.childrenInstitutions = [];

        instLinksCtrl.goToInst = function goToInst(institutionKey) {
            const url = $state.href(STATES.INST_TIMELINE, { institutionKey: institutionKey });
            window.open(url, '_blank');
        };

        instLinksCtrl.hasInstitutions = function hasInstitutions() {
            return !instLinksCtrl.isLoadingInsts
                && (instLinksCtrl.hasParentInst() || instLinksCtrl.hasChildrenInst());
        };

        instLinksCtrl.hasParentInst = function hasParentInst() {
            return !_.isEmpty(instLinksCtrl.parentInstitution);
        };

        instLinksCtrl.hasChildrenInst = function hasChildrenInst() {
            return !_.isEmpty(instLinksCtrl.childrenInstitutions);
        };

        instLinksCtrl.parentStatus = function parentStatus() {
            const parentInstitution = instLinksCtrl.parentInstitution;
            const childrenInstitutionsOfParent = parentInstitution.children_institutions
            const institutionKey = instLinksCtrl.institution.key;
            return instLinksCtrl.parentInstitution && _.find(childrenInstitutionsOfParent, inst => inst.key === institutionKey ) ?
                "confirmado" : "não confirmado";
        };

        instLinksCtrl.childStatus = function childStatus(institution) {
            return institution.parent_institution && institution.parent_institution === instLinksCtrl.institution.key ? "confirmado" : "não confirmado";
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                instLinksCtrl.institution = response;
                var parentInstitution = response.parent_institution;
                instLinksCtrl.parentInstitution = parentInstitution && parentInstitution.state === "active" ? parentInstitution : {};
                instLinksCtrl.childrenInstitutions = response.children_institutions.filter(inst => inst.state === "active");
                instLinksCtrl.isLoadingInsts = false;
            }, function error() {
                instLinksCtrl.isLoadingInsts = true;
            });
        }

        loadInstitution();
    });
})();