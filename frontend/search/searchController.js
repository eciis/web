'use strict';

(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService, $http, brCidadesEstados) {

        var searchCtrl = this;

        searchCtrl.search_keyword = $state.params.search_keyword;
        searchCtrl.previous_keyword =  searchCtrl.search_keyword;
        searchCtrl.initialInstitutions = [];
        searchCtrl.institutions = [];
        searchCtrl.actuationAreas = [];
        searchCtrl.legalNature = [];
        var actuationAreas;
        var legalNatures;
        searchCtrl.loading = false;
        searchCtrl.searchActuation = "";
        console.log(searchCtrl.searchActuation);

        searchCtrl.makeSearch = function makeSearch(value, type) {
            searchCtrl.loading = false;
            var promise = InstitutionService.searchInstitutions(value ? value : searchCtrl.search_keyword, "active", type);
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
            }
        };

        searchCtrl.notHasInstitutions = function notHasInstitutions() {
            return _.isEmpty(searchCtrl.institutions);
        };

        searchCtrl.goToInstitution = function goToInstitution(institutionId) {
            if (institutionId) {
                InstitutionService.getInstitution(institutionId).then(function success(response) {
                    $state.go('app.institution.timeline', {institutionKey: response.data.key});
                });
            }
        };

        searchCtrl.searchBy = function searchBy(search, attribute) {
            console.log(searchCtrl.searchActuation);
            if(_.isEmpty(searchCtrl.initialInstitutions) || searchCtrl.search_keyword != searchCtrl.previous_keyword) {
                searchCtrl.makeSearch(search, 'institution');
                searchCtrl.previous_keyword = searchCtrl.search_keyword;
            } else {
                getFilteredInstitutions(search, attribute);
            }
        };

        function getFilteredInstitutions(search, attribute) {
            _.remove(searchCtrl.institutions, function (institution) {
                return institution[attribute] != search;
            });
        }

        searchCtrl.isLoading = function isLoading() {
            return !searchCtrl.loading && searchCtrl.search_keyword;
        };

        function getActuationAreas() {
            $http.get('app/institution/actuation_area.json').then(function success(response) {
                searchCtrl.actuationAreas = objectToObjectArray(response.data);
                actuationAreas = response.data;
            });
        }

        function getLegalNatures() {
            $http.get('app/institution/legal_nature.json').then(function success(response) {
                searchCtrl.legalNature = objectToObjectArray(response.data);
                legalNatures = response.data;
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
            var array = [];
            _.forEach(keys, function(key) {
                var current_obj = {}
                current_obj.name = object[key];
                current_obj.value = key;
                array.push(current_obj);
            });
            return array;
        }

        (function main() {
            getActuationAreas();
            getLegalNatures();
            loadSearch();
            loadBrazilianFederalStates();
        })();
    });
})();