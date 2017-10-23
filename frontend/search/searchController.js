'use strict';

(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService, $http) {

        var searchCtrl = this;

        searchCtrl.search_keyword = $state.params.search_keyword;
        searchCtrl.institutions = [];
        searchCtrl.occupationAreas = [];
        searchCtrl.isLoading = false;

        searchCtrl.makeSearch = function makeSearch(value) {
            searchCtrl.isLoading = true;
            var promise = InstitutionService.searchInstitutions(value ? value : searchCtrl.search_keyword, "active");
            promise.then(function success(response) {
                searchCtrl.institutions = response.data;
                searchCtrl.isLoading = false;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        searchCtrl.search = function search() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch();
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

        searchCtrl.searchByOccupationArea = function searchByOccupationArea(chosen_area) {
            searchCtrl.makeSearch(chosen_area);
        };

        function getOccupationAreas() {
            $http.get('app/institution/occupation_area.json').then(function success(response) {
                searchCtrl.occupationAreas = response.data;
            });
        }

        function loadSearch() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch();
            }
        }

        (function main() {
            getOccupationAreas();
            loadSearch();
        })();
    });
})();