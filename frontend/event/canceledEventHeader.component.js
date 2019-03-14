"use strict";

(function() {

    function CanceledEventController() {
        const canceledEventCtrl = this;

        /**
         * Get the first name of who modified the event by last
         */
        canceledEventCtrl.getNameOfLastModified = () => {
            return _.first(canceledEventCtrl.event.last_modified_by.split(" "));
        };

    };

     angular
    .module("app")
    .component("canceledEventHeader", {
        templateUrl: 'app/event/canceled_event_header.html',
        controller: [CanceledEventController],
        controllerAs: 'canceledEventCtrl',
        bindings: {
            event: '<',
        }
    });
})();