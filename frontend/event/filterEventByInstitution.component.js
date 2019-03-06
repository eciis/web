(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('FilterEventsByInstitutionController', function() {
        const filterCtrl = this;

        filterCtrl.$onInit = function() {
            console.log(filterCtrl.filterList);
        };
    })
    
    app.component("filterEventsByInstitution", {
        templateUrl: 'app/event/filter_events_by_institution.html',
        controller: 'FilterEventsByInstitutionController',
        controllerAs: 'filterCtrl',
        bindings: {
            filterList: '<'
        }
    });
})();