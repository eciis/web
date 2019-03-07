(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('FilterEventsByInstitutionController', function() {
        const filterCtrl = this;
        filterCtrl.originalList = [];
        filterCtrl.enableAll = true;


        filterCtrl.checkChange = function checkChange() {
            filterCtrl.enableAll = (_.find(filterCtrl.filterList, institution => !institution.enable)) ? false : true;
        };

        filterCtrl.enableOrDisableAll = function enableOrDisableAll() {
            filterCtrl.filterList.map(institution => institution.enable = filterCtrl.enableAll);
        };

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
    
    app.component("filterEventsByInstitution", {
        templateUrl: 'app/event/filter_events_by_institution.html',
        controller: 'FilterEventsByInstitutionController',
        controllerAs: 'filterCtrl',
        bindings: {
            filterList: '<',
            confirmAction: '<',
            cancelAction: '<'
        }
    });
})();