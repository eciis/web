"use strict";

(function() {
    const app = angular.module("app");

    app.controller("EventCardController", function EventCardController(AuthService) {
        const eventCardCtrl = this;
        
        eventCardCtrl.user = AuthService.getCurrentUser();

        /**
         * Get the color of institutional profile of the user
         */
        eventCardCtrl.getProfileColor = () => {
            const profile = _.filter(eventCardCtrl.user.institution_profiles, function(prof) {
                return prof.institution_key === eventCardCtrl.event.institution_key;
            });
            return _.get(_.first(profile), 'color', 'teal');
        };

        eventCardCtrl.$onInit = () => {
            const address = eventCardCtrl.event.address;
            if (_.isString(address)) {
                eventCardCtrl.event.address = JSON.parse(address);
            }
        };
    });

    app.component("eventCard", {
        templateUrl: 'app/event/event_card.html',
        controller: 'EventCardController',
        controllerAs: 'eventCardCtrl',
        bindings: {
            event: '<',
        }
    });
})();