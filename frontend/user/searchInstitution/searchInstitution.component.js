"use strict";

(function() {
    angular.module("app")
        .component("searchInstitution", {
            templateUrl: 'app/user/searchInstitution/search_institution.html',
            controller: SearchInstitutionCtrl,
            controllerAs: 'searchInstCtrl',
            bindings: {
                onSelect: '<'
            }
        });

    function SearchInstitutionCtrl(InstitutionService) {
        const searchInstCtrl = this;

        searchInstCtrl.keyword = "";
        searchInstCtrl.institutions = [];
        searchInstCtrl.selectedInst = {};


        searchInstCtrl.getInstIcon = function (inst) {
            return searchInstCtrl.isInstSelect(inst) ? 'done' : 'account_balance';
        }

        searchInstCtrl.isInstSelect = function isInstSelect(institution){
            return searchInstCtrl.selectedInst.key === institution.id;
        };

        searchInstCtrl.address = function () {
            const instObject = new Institution(searchInstCtrl.selectedInst);
            return instObject.getSimpleAddress();
        };

        searchInstCtrl.search = function () {
            const INST_STATE = 'active';
            InstitutionService.searchInstitutions(searchInstCtrl.keyword, INST_STATE, 'institution')
                .then(institutions => {
                    searchInstCtrl.institutions = institutions;
                });
        };

        searchInstCtrl.select = function (institution){
            InstitutionService.getInstitution(institution.id)
                .then(institution => {
                    searchInstCtrl.selectedInst = institution;
                    searchInstCtrl.onSelect(institution);
            });
        };
    }
})();
