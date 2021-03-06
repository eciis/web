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

        instLinksCtrl.goToInst = function goToInst(institution) {
            const url = $state.href(STATES.INST_TIMELINE, { institutionKey: institution.key });
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
            const isParentConfirmed = instLinksCtrl.parentInstitution && _.find(childrenInstitutionsOfParent, inst => inst.key === institutionKey );
            return isParentConfirmed ? "Confirmado" : "Não confirmado";
        };

        instLinksCtrl.childStatus = function childStatus(institution) {
            const isChildConfirmed = institution.parent_institution && institution.parent_institution === instLinksCtrl.institution.key;;
            return isChildConfirmed ? "Confirmado" : "Não confirmado";
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