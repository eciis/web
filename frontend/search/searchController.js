'use strict';

(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService, $http) {

        var searchCtrl = this;

        searchCtrl.search_keyword = $state.params.search_keyword;
        searchCtrl.institutions = [];
        searchCtrl.actuationAreas = [];
        searchCtrl.loading = false;

        searchCtrl.makeSearch = function makeSearch(value, type) {
            searchCtrl.loading = false;
            var promise = InstitutionService.searchInstitutions(value ? value : searchCtrl.search_keyword, "active", type);
            promise.then(function success(response) {
                searchCtrl.institutions = response.data;
                searchCtrl.loading = true;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        searchCtrl.search = function search() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
            }
        };

        searchCtrl.notHasInstitutions = function notHasInstitutions() {
            return _.isEmpty(searchCtrl.institutions);
        };

        searchCtrl.goToInstitution = function goToInstitution(institutionId) {
            if (institutionId) {
                InstitutionService.getInstitution(institutionId).then(function success(response) {
                    $state.go('app.institution', {institutionKey: response.data.key});
                });
            }
        };

        searchCtrl.searchByActuationArea = function searchByActuationArea(chosen_area) {
            searchCtrl.makeSearch(chosen_area, 'institution');
        };

        searchCtrl.isLoading = function isLoading() {
            return !searchCtrl.loading && searchCtrl.search_keyword;
        };

        function getActuationAreas() {
            $http.get('app/institution/actuation_area.json').then(function success(response) {
                searchCtrl.actuationAreas = response.data;
            });
        }

        function loadSearch() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
            }
        }

        (function main() {
            getActuationAreas();
            loadSearch();
        })();
    });
})();