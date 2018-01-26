'use strict';

(function () {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService,
        brCidadesEstados, HttpService) {

        var searchCtrl = this;

        searchCtrl.search_keyword = $state.params.search_keyword;
        searchCtrl.previous_keyword = searchCtrl.search_keyword;
        searchCtrl.initialInstitutions = [];
        searchCtrl.institutions = [];
        searchCtrl.actuationAreas = [];
        searchCtrl.legalNature = [];
        var actuationAreas;
        var legalNatures;
        searchCtrl.loading = false;

        searchCtrl.makeSearch = function makeSearch(value, type) {
            searchCtrl.loading = false;
            var valueOrKeyword = value ? value : (searchCtrl.search_keyword || "");
            var promise = InstitutionService.searchInstitutions(valueOrKeyword, "active", type);
            promise.then(function success(response) {
                searchCtrl.institutions = response.data;
                searchCtrl.initialInstitutions = _.clone(searchCtrl.institutions);
                searchCtrl.loading = true;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        searchCtrl.search = function search() {
            if (searchCtrl.search_keyword) {
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution');
                refreshPreviousKeyword();
            }
        };

        searchCtrl.notHasInstitutions = function notHasInstitutions() {
            return _.isEmpty(searchCtrl.institutions);
        };

        searchCtrl.goToInstitution = function goToInstitution(institutionId) {
            if (institutionId) {
                InstitutionService.getInstitution(institutionId).then(function success(response) {
                    $state.go('app.institution.timeline', { institutionKey: response.data.key });
                });
            }
        };

        searchCtrl.searchBy = function searchBy(search) {
            if (keywordHasChanges()) {
                searchCtrl.makeSearch(search, 'institution');
                refreshPreviousKeyword();
            }
        };

        function keywordHasChanges() {
            var keywordHasChanged = searchCtrl.search_keyword != searchCtrl.previous_keyword;
            return _.isEmpty(searchCtrl.initialInstitutions) || keywordHasChanged || !searchCtrl.search_keyword;
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

        function refreshPreviousKeyword() {
            searchCtrl.previous_keyword = searchCtrl.search_keyword;
        }

        (function main() {
            getActuationAreas();
            getLegalNatures();
            loadSearch();
            loadBrazilianFederalStates();
        })();
    });
})();