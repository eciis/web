(function() {
    "use strict";

    /**
     * Component used do render an input search field. 
     * It may receive a placeholder, but it has the default value 'Pesquisar'.
     * It also receives a keyword, that is the variable that will store the user input.
     * The given variable may than be user as a filter parameter in some ng-repeat directive.
     * 
     * @class searchField
     * @example
     * <search-field placeholder="some text" keyword="someVariable"></search-field>
     * <div ng-repeat="item in items | filter: someVaribale">{{item}}</div>
     */
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