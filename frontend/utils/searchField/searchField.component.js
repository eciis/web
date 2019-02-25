"use strict";

(function() {
    angular
    .module('app')
    .component('searchField', {
        templateUrl: 'app/utils/searchField/search_field.html',
        controller: searchFieldController,
        controllerAs: 'searchFieldCtrl',
        bindings: {
            placeholder: '@',
            keyword: '='
        }
    });

    function searchFieldController() {
        const searchFieldCtrl = this;

        searchFieldCtrl.$onInit = () => {
            _.defaults(searchFieldCtrl, {
                placeholder: 'Pesquisar',
                keyword: ''
            });
        };
    }
})();