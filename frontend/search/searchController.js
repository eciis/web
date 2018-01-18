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

        searchCtrl.makeSearch = function makeSearch(value, type, attribute) {
            searchCtrl.loading = false;
            var promise = InstitutionService.searchInstitutions(value ? value : searchCtrl.search_keyword, "active", type);
            promise.then(function success(response) {
                searchCtrl.institutions = response.data;
                searchCtrl.initialInstitutions = _.clone(searchCtrl.institutions);
                searchCtrl.loading = true;
                getFilteredInstitutions(value, attribute);
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
            if((_.isEmpty(searchCtrl.initialInstitutions) || searchCtrl.search_keyword != searchCtrl.previous_keyword || !searchCtrl.search_keyword) && (search || searchCtrl.search_keyword))  {
                searchCtrl.makeSearch(search, 'institution', attribute);
                searchCtrl.previous_keyword = searchCtrl.search_keyword;
            } else {
                getFilteredInstitutions(search, attribute);
            }
        };

        function getFilteredInstitutions(search, attribute) {
            console.log(search);
            console.log(attribute);
            searchCtrl.institutions = _.filter(searchCtrl.initialInstitutions, function (institution) {
                var sameNature = legalNatures[institution.legal_nature] == searchCtrl.searchNature || !searchCtrl.searchNature || searchCtrl.searchNature == "Pesquisar em todas as áreas";
                var sameActuationArea = actuationAreas[institution.actuation_area] == searchCtrl.searchActuation || !searchCtrl.searchActuation || searchCtrl.searchActuation == "Pesquisar em todas as áreas";
                var sameState = !searchCtrl.searchState || institution.federal_state == searchCtrl.searchState.nome || searchCtrl.searchState == "Pesquisar em todos os estados";
                var returnValue = { 
                    "actuation_area": (institution.actuation_area == search && sameNature && sameState) || !search,
                    "legal_nature": (institution.legal_nature == search && sameActuationArea && sameState) || !search,
                    "federal_state": (institution.federal_state == search && sameActuationArea && sameNature) || !search,
                    "": true,
                    undefined: true
                }
                return returnValue[attribute];
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