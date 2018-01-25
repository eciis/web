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

        searchCtrl.searchBy = function searchBy(search, attribute) {
            if (keywordHasChanges()) {
                searchCtrl.makeSearch(search, 'institution', attribute);
                refreshPreviousKeyword();
            } else {
                getFilteredInstitutions(search, attribute);
            }
        };


        /**
         * By filtering the initialInstitutions this method gets the searched ones by
         * comparing the attribute selected with the search param value.
         * Besides, only the others attributes are compared with the controller's fields, 
         * once they wouldn't be updated as expected if one of them were the selected one.
         * @param {string} search: The search's string 
         * @param {string} attribute: The searched attribute 
         */
        function getFilteredInstitutions(search, attribute) {
            searchCtrl.institutions = _.filter(searchCtrl.initialInstitutions, function (institution) {
                return canInstitutionBeInFilteredList(institution, search, attribute);
            });
        }

        /**
         * An institution can be in filtered list if its searched attribute
         * is equal to the search value and if the others attributes are equal
         * to those of the controller or aren't selected.
         */
        function canInstitutionBeInFilteredList(institution, search, attribute) {
            //That's necessary once the function needs to know which is the attribute selected
            var natureIsNotSelected = fieldIsNotSelected(searchCtrl.searchNature, "Pesquisar em todas as áreas");
            var actuationIsNotSelected = fieldIsNotSelected(searchCtrl.searchActuation, "Pesquisar em todas as áreas");
            var stateIsNotSelected = fieldIsNotSelected(searchCtrl.searchState, "Pesquisar em todos os estados");

            // True If the institution's fields and controller's fields are the same or If the field is not selected. 
            var sameNature = legalNatures[institution.legal_nature] === searchCtrl.searchNature || natureIsNotSelected;
            var sameActuationArea = actuationAreas[institution.actuation_area] === searchCtrl.searchActuation || actuationIsNotSelected;
            var sameState = stateIsNotSelected || institution.federal_state === searchCtrl.searchState.nome;

            var searchedAttributeCondition = getSearchedAttributeCondition(institution, search,
                { nature: sameNature, actuation: sameActuationArea, state: sameState }
            );

            return attribute ? searchedAttributeCondition[attribute] : true;
        }

        /**
         * The field is not selected if its controller's property is undefined 
         * or equal to the default value
         * @param {string} field 
         * @param {string} defaultValue 
         */
        function fieldIsNotSelected(field, defaultValue) {
            return !field || field === defaultValue;
        }

        /**
         * Returns an object that stores if the search's attribute is the same
         * in the institution and in the search param and if the others controller's and
         * institution's fields are the same. Thus, it's possible to know if the institution
         * can stay in the filtered list.
         * @param {object} samePropertiesObject: An object that allows to know if the institution's
         * attributes are equal to those of the controller.
         */
        function getSearchedAttributeCondition(institution, search, samePropertiesObject) {
            return {
                "actuation_area": ((institution.actuation_area === search || !search) &&
                    samePropertiesObject.nature && samePropertiesObject.state),
                "legal_nature": ((institution.legal_nature === search || !search) &&
                    samePropertiesObject.actuation && samePropertiesObject.state),
                "federal_state": ((institution.federal_state === search || !search) &&
                    samePropertiesObject.actuation && samePropertiesObject.nature),
            }
        }

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