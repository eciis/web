'use strict';
(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService) {

        var searchCtrl = this;

        searchCtrl.keyWord = '';
        searchCtrl.finalSearch = $state.params.finalSearch;
        searchCtrl.institutions = [];
        searchCtrl.load = false;

        searchCtrl.makeSearch = function makeSearch() {
            searchCtrl.load = false;
            var promise = InstitutionService.searchInstitutions(searchCtrl.finalSearch, "active");
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

        function loadSearch() {
            if (searchCtrl.finalSearch) {
                searchCtrl.makeSearch();
            }
        }

        loadSearch();
    });
})();