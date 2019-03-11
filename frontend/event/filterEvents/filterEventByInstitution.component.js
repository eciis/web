(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('FilterEventsByInstitutionController', function() {
        const filterCtrl = this;
        filterCtrl.originalList = [];
        filterCtrl.enableAll = true;


        /**
         * This function checks if all filters are enabled 
         * and changes the enableAll variable to true, 
         * if there is at least one disabled, switch to false.
         */
        filterCtrl.checkChange = function checkChange() {
            filterCtrl.enableAll = (_.find(filterCtrl.filterList, institution => !institution.enable)) ? false : true;
        };

        /**
         * This function enables or disables all filters,
         * according to the enableAll variable
         */
        filterCtrl.enableOrDisableAll = function enableOrDisableAll() {
            filterCtrl.filterList.map(institution => institution.enable = filterCtrl.enableAll);
        };

        /**
         * This function cancels the filter modification 
         * and returns it to the original state.
         */
        filterCtrl.cancel = function cancel() {
            filterCtrl.filterList.map((institution, index) => {
                institution.enable = filterCtrl.originalList[index].enable;
            });
            filterCtrl.cancelAction();
        };

        filterCtrl.$onInit = function() {
           filterCtrl.originalList = _.cloneDeep(filterCtrl.filterList);
           filterCtrl.checkChange();
        };
    });
    
    /**
     * Filter events by institution component
     * @example
     * <filter-events-by-institution filter-list='...' cancel-action="..." confirm-action="...">
     * </filter-events-by-institution>
     */
    app.component("filterEventsByInstitution", {
        templateUrl: 'app/event/filterEvents/filter_events_by_institution.html',
        controller: 'FilterEventsByInstitutionController',
        controllerAs: 'filterCtrl',
        bindings: {
            filterList: '<',
            confirmAction: '<',
            cancelAction: '<'
        }
    });
})();