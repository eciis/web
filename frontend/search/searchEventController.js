'use strict';

(function () {
    var app = angular.module('app');

    app.controller("SearchEventController", function SearchEventController(brCidadesEstados, HttpService,
        $window, STATES, AuthService, EventService) {

        var searchCtrl = this;

        searchCtrl.search_keyword = '';
        searchCtrl.previous_keyword = searchCtrl.search_keyword;
        searchCtrl.events = [];
        searchCtrl.loading = false;
        searchCtrl.hasChanges = false;
        searchCtrl.hasNotSearched = true;
        searchCtrl.user = AuthService.getCurrentUser();

        searchCtrl.makeSearch = function makeSearch(value, type) {
            searchCtrl.loading = false;
            const valueOrKeyword = value ? value : (searchCtrl.search_keyword || "");
            let promise = EventService.searchEvents(valueOrKeyword, "published", type);
            promise.then(function success(response) {
                searchCtrl.events = response;
                searchCtrl.loading = true;
                searchCtrl.hasChanges = true;
            });
            return promise;
        };

        searchCtrl.setHasChanges = () => {
            searchCtrl.hasChanges = Boolean(searchCtrl.search_keyword);
        };

        searchCtrl.clearFilters = function clearFilters() {
            searchCtrl.searchState = "";
            searchCtrl.searchDate = "";
            searchCtrl.searchCountry = "";
            searchCtrl.searchCity = "";
            searchCtrl.events = [];
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
        searchCtrl.search = function search() {
            if (searchCtrl.search_keyword) {
                let promise = searchCtrl.makeSearch(searchCtrl.search_keyword, 'event');
                promise.then(() => {
                    searchCtrl.setupResultsInMobile();
                    refreshPreviousKeyword();
                });
                return promise;
            } else {
                searchCtrl.setupResultsInMobile();
            }
        };

        searchCtrl.searchBy = function searchBy(search) {
            if (keywordHasChanges()) {
                searchCtrl.makeSearch(search, 'event');
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
         * Go to the page of a specific event
         * @param {object} event - The current event
         */
        searchCtrl.goToEvent = (event) => {
            event.state !== 'deleted' && $state.go(STATES.EVENT_DETAILS, { eventKey: event.id });
        };

        searchCtrl.isAnotherCountry = () => searchCtrl.searchCountry !== "Brasil";

        searchCtrl.closeSearchResult = () => {
            searchCtrl.hasNotSearched = true;
            searchCtrl.clearFilters();
            refreshPreviousKeyword();
            searchCtrl.search_keyword = '';
        };

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

        function loadSearch() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
            }
        }

        function loadCountries() {
            HttpService.get('app/institution/countries.json').then(function success(response) {
                searchCtrl.countries = response;
            });
        }

        searchCtrl.getCitiesByState = () => {
            searchCtrl.cities = brCidadesEstados.buscarCidadesPorSigla(searchCtrl.searchState.sigla);
        };

        function loadBrazilianFederalStates() {
            searchCtrl.brazilianFederalStates = brCidadesEstados.estados;
        }

        (function main() {
            loadSearch();
            loadBrazilianFederalStates();
            loadCountries();
        })();
    });
})();