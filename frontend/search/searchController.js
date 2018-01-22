'use strict';

(function() {
    var app = angular.module('app');

    app.controller("SearchController", function SearchController($state, InstitutionService, MessageService, 
        brCidadesEstados, HttpService) {

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
            var valueOrKeyword = value ? value : (searchCtrl.search_keyword || "");
            var promise = InstitutionService.searchInstitutions(valueOrKeyword, "active", type);
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
                searchCtrl.previous_keyword = searchCtrl.search_keyword;
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
            if (searchInServer())  {
                searchCtrl.makeSearch(search, 'institution', attribute);
                searchCtrl.previous_keyword = searchCtrl.search_keyword;
            } else {
                getFilteredInstitutions(search, attribute);
            }
        };

        function getFilteredInstitutions(search, attribute) {
            searchCtrl.institutions = _.filter(searchCtrl.initialInstitutions, function (institution) {
                return canInstitutionBeInFilteredList(institution, search, attribute);
            });
        }

        function canInstitutionBeInFilteredList (institution, search, attribute) {
            var natureDefaultValue = searchCtrl.searchNature === "Pesquisar em todas as áreas";
            var actuationDefaultValue = searchCtrl.searchActuation === "Pesquisar em todas as áreas";
            var stateDefaultValue = searchCtrl.searchState === "Pesquisar em todos os estados";

            var natureIsNotSelected = !searchCtrl.searchNature || natureDefaultValue;
            var actuationIsNotSelected = !searchCtrl.searchActuation || actuationDefaultValue;
            var stateIsNotSelected = !searchCtrl.searchState || stateDefaultValue;

            // True If the fields are the same or If the field is not selected. 
            var sameNature = legalNatures[institution.legal_nature] === searchCtrl.searchNature || natureIsNotSelected;
            var sameActuationArea = actuationAreas[institution.actuation_area] === searchCtrl.searchActuation || actuationIsNotSelected;
            var sameState = stateIsNotSelected || institution.federal_state === searchCtrl.searchState.nome;

            // It keeps If the search's current attribute is the same in the institution and the search param and
            // If the others controller's and institution's fields are the same.
            var returnValue = {
                "actuation_area": ((institution.actuation_area === search || !search) && sameNature && sameState),
                "legal_nature": ((institution.legal_nature === search || !search) && sameActuationArea && sameState),
                "federal_state": ((institution.federal_state === search || !search) && sameActuationArea && sameNature),
            }

            return attribute ? returnValue[attribute] : true;
        }

        function searchInServer () {
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
            _.forEach(keys, function(key) {
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