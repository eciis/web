'use strict';

(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService, $http) {

        var searchCtrl = this;

        searchCtrl.keyWord = '';
        searchCtrl.finalSearch = $state.params.finalSearch;
        searchCtrl.institutions = [];
        searchCtrl.occupationAreas = [];
        searchCtrl.load = false;

        searchCtrl.makeSearch = function makeSearch(value) {
            searchCtrl.load = false;
            var promise = InstitutionService.searchInstitutions(value ? value : searchCtrl.finalSearch, "active");
            promise.then(function success(response) {
                searchCtrl.institutions = response.data;
                searchCtrl.load = true;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        searchCtrl.search = function search() {
            if (searchCtrl.keyWord) {
                searchCtrl.finalSearch = searchCtrl.keyWord;
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

        searchCtrl.teste = function(value) {
            searchCtrl.makeSearch(value);
        };

        function getOccupationAreas() {
            $http.get('app/institution/occupation_area.json').then(function success(response) {
                searchCtrl.occupationAreas = response.data;
            });
        }

        function loadSearch() {
            if (searchCtrl.finalSearch) {
                searchCtrl.makeSearch();
            }
        }

        getOccupationAreas();
        loadSearch();
    });
})();