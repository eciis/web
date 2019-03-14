"use strict";

(function() {

    function EventCardController(AuthService) {
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
    };

     angular
    .module("app")
    .component("eventCard", {
        templateUrl: 'app/event/event_card.html',
        controller: ['AuthService', EventCardController],
        controllerAs: 'eventCardCtrl',
        bindings: {
            event: '<',
        }
    });
})();