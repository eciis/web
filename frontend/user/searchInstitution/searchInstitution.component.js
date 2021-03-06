"use strict";

(function() {
    angular
    .module("app")
    .component("searchInstitution", {
        templateUrl: 'app/user/searchInstitution/search_institution.html',
        controller: SearchInstitutionCtrl,
        controllerAs: 'searchInstCtrl',
        bindings: {
            onSelect: '<',
            onSearch: '<'
        }
    });

    function SearchInstitutionCtrl(InstitutionService, $state) {
        const searchInstCtrl = this;

        searchInstCtrl.keyword = "";
        searchInstCtrl.institutions = [];
        searchInstCtrl.selectedInst = {};
        searchInstCtrl.isInstLoaded = false;
        
        /**
         * Get the institution icon depending on whether the institution is selected
         */
        searchInstCtrl.getInstIcon = function (inst) {
            return searchInstCtrl.isInstSelected(inst) ? 'done' : 'account_balance';
        };

        /**
         * Check if the institution is selected and loaded
         */
        searchInstCtrl.isInstSelected = function (institution){
            const selecteInstKey = _.get(searchInstCtrl, 'selectedInst.key', undefined);
            return selecteInstKey === institution.id && searchInstCtrl.isInstLoaded;
        };

        /**
         * Search for an institution based on the user input
         */
        searchInstCtrl.search = function () {
            /**
             * TODO: Modify the inst search document to store the inst's address. 
             * Thus, the get request done at the select function will be unnecessary.
            */
            const INST_STATE = 'active';
            InstitutionService.searchInstitutions(searchInstCtrl.keyword, INST_STATE, 'institution')
                .then(institutions => {
                    searchInstCtrl.institutions = institutions;
                    searchInstCtrl.instNotFound = institutions.length === 0;
                    searchInstCtrl.onSearch(institutions);
                });
        };

        /**
         * Select an institution and load its data
         */
        searchInstCtrl.select = function (institution){
            InstitutionService.getInstitution(institution.id)
                .then(institution => {
                    searchInstCtrl.selectedInst = new Institution(institution);
                    searchInstCtrl.isInstLoaded = true;
                    searchInstCtrl.onSelect(institution);
            });
        };

        /**
         * Go to the create institution form state
         */
        searchInstCtrl.createInst = function createInst() {
            $state.go("create_institution_form");
        };
    }
})();
