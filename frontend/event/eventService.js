'use strict';

(function() {
    var app = angular.module("app");

    app.service("EventService", function EventService(HttpService, $q) {
        var service = this;

        var EVENT_URI = "/api/events";
        var INST_URI = "/api/institutions/"
        var LIMIT = "5";

        service.createEvent = function createEvent(event) {
            return HttpService.post(EVENT_URI, event);
        };

        service.getEvents = function getEvents(page) {
            return HttpService.get(EVENT_URI + '?page=' + page + "&limit=" + LIMIT);
        };

        service.getInstEvents = function getInstEvents(page, institution_key) {
            return HttpService.get(INST_URI + institution_key + '/events?page=' + page + "&limit=" + LIMIT);
        };

        service.deleteEvent = function deleteEvent(event) {
            return HttpService.delete(EVENT_URI + '/' + event.key);
        };

        service.getEvent = function getEvent(eventKey) {
            return HttpService.get(EVENT_URI + '/' + eventKey);
        };

        service.editEvent = function editEvent(eventKey, patch) {
            return HttpService.patch(EVENT_URI + '/' + eventKey, patch);
        };
    });
})();