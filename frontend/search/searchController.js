'use strict';

(function () {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService,
        brCidadesEstados, HttpService, $mdDialog, $window, STATES, AuthService) {

        var searchCtrl = this;

        searchCtrl.search_keyword = $state.params.search_keyword;
        // This field allows the controller know when it has to go to the server to make the search.
        searchCtrl.previous_keyword = searchCtrl.search_keyword;
        searchCtrl.institutions = [];
        searchCtrl.actuationAreas = [];
        searchCtrl.legalNature = [];
        var actuationAreas;
        var legalNatures;
        searchCtrl.loading = false;
        searchCtrl.hasChanges = false;
        searchCtrl.hasNotSearched = true;
        searchCtrl.user = AuthService.getCurrentUser();

        searchCtrl.makeSearch = function makeSearch(value, type) {
            searchCtrl.loading = false;
            var valueOrKeyword = value ? value : (searchCtrl.search_keyword || "");
            var promise = InstitutionService.searchInstitutions(valueOrKeyword, "active", type);
            promise.then(function success(response) {
                searchCtrl.institutions = response;
                searchCtrl.loading = true;
                searchCtrl.hasChanges = true;
            });
            return promise;
        };

        searchCtrl.setHasChanges = () => {
            searchCtrl.hasChanges = Boolean(searchCtrl.search_keyword);
        };

        searchCtrl.clearFilters = function clearFilters() {
            searchCtrl.searchActuation = "";
            searchCtrl.searchNature = "";
            searchCtrl.searchState = "";
            searchCtrl.institutions = [];
        };

        /**
         * First of all it checks if there is a search
         * keyword before make the search to avoid unecessary requests.
         * Then, make search is called and the result is stored in
         * searchCtrl.institutions. If the user is using a mobile
         * showSearchFromMobile is called to open a mdDialog with the
         * search's result.
         * @param {Event} ev : The event that is useful to deal with the mdDialog.
         * When the user isn't in a mobile its value is undefined. 
         */
        searchCtrl.search = function search(ev) {
            if (searchCtrl.search_keyword) {
                let promise = searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
                promise.then(() => {
                    searchCtrl.setupResultsInMobile();
                });
                refreshPreviousKeyword();

                return promise;
            } else {
                searchCtrl.setupResultsInMobile();
            }
        };

        searchCtrl.goToInstitution = function goToInstitution(institutionId) {
            if (institutionId) {
                $state.go(STATES.INST_TIMELINE, { institutionKey: institutionId });
            }
        };

        searchCtrl.searchBy = function searchBy(search) {
            if (keywordHasChanges()) {
                searchCtrl.makeSearch(search, 'institution');
                refreshPreviousKeyword();
            }
        };

        /**
         * Change the title position and the flag that decides
         * if the results gotta be shown or not.
         */
        searchCtrl.setupResultsInMobile = () => {
            if (searchCtrl.isMobileScreen()) {
                const title = document.getElementById('search-title');
                if (title) {
                    title.style.marginTop = '1em';
                }

                searchCtrl.hasNotSearched = false;
            }
        };
        
        /**
         * Go back to the previous state.
         */
        searchCtrl.leaveMobileSearchPage = () => {
            $window.history.back();
        };

        /**
         * Check if the user is in a mobile or not.
         */
        searchCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen();
        };
        
        /**
         * A simple function that works like a controller to the
         * search_dialog.html.
         */
        function SearchDialogController() {
            const searchDialogCtrl = this;

            searchDialogCtrl.institutions = searchCtrl.institutions;
            searchDialogCtrl.searchNature = searchCtrl.searchNature;
            searchDialogCtrl.searchActuation = searchCtrl.searchActuation;
            searchDialogCtrl.searchState = searchCtrl.searchState;
            searchDialogCtrl.isLoading = searchCtrl.isLoading;

            /**
             * Close the dialog and then call the regular goToInstitution
             * function.
             * @param {String} institutionId 
             */
            searchDialogCtrl.goToInstitution = (institutionId) => {
                $mdDialog.cancel();
                searchCtrl.goToInstitution(institutionId);
            };
        }

        /**
         * This function verifies if there is any changes in the search_keyword.
         * If it has changes, the search will be made in the server and the
         * previous_keyword will be updated. Otherwise, the search is just a filtering
         * in the controller's institutions field.
         */
        function keywordHasChanges() {
            var keywordHasChanged = searchCtrl.search_keyword !== searchCtrl.previous_keyword;
            return _.isEmpty(searchCtrl.institutions) || keywordHasChanged || !searchCtrl.search_keyword;
        }

        /**
         * Refreshes the previous_keyword field. It is called
         * when the controller goes to the server to make the search,
         * in other words, when the search_keywords changes.
         */
        function refreshPreviousKeyword() {
            searchCtrl.previous_keyword = searchCtrl.search_keyword;
        }

        searchCtrl.isLoading = function isLoading() {
            return !searchCtrl.loading && searchCtrl.search_keyword;
        };

        function getActuationAreas() {
            HttpService.get('app/institution/actuation_area.json').then(function success(response) {
                searchCtrl.actuationAreas = objectToObjectArray(response);
                actuationAreas = response;
            });
        }

        function getLegalNatures() {
            HttpService.get('app/institution/legal_nature.json').then(function success(response) {
                searchCtrl.legalNature = objectToObjectArray(response);
                legalNatures = response;
            });
        }

        function loadSearch() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
            }
        }

        function loadBrazilianFederalStates() {
            searchCtrl.brazilianFederalStates = brCidadesEstados.estados;
        }

        function objectToObjectArray(object) {
            var keys = _.keys(object);
            var arrayToReturn = [];
            _.forEach(keys, function (key) {
                var current_obj = {}
                current_obj.name = object[key];
                current_obj.value = key;
                arrayToReturn.push(current_obj);
            });
            return arrayToReturn;
        }

        (function main() {
            getActuationAreas();
            getLegalNatures();
            loadSearch();
            loadBrazilianFederalStates();
        })();
    });
})();