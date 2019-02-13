'use strict';

(function() {
    var app = angular.module("app");

    app.service("EventService", function EventService(HttpService, $q) {
        var service = this;

        var EVENT_URI = "/api/events";
        var INST_URI = "/api/institutions/"
        var LIMIT = "15";

        service.createEvent = function createEvent(event) {
            return HttpService.post(EVENT_URI, event);
        };

        service.getEvents = function getEvents({page, month, year}) {
            let url = EVENT_URI + '?page=' + page + "&limit=" + LIMIT;
            if(month && year) url += "&month=" + month + "&year=" + year;
            return HttpService.get(url);
        };

        service.getInstEvents = function getInstEvents({page, institutionKey}) {
            return HttpService.get(INST_URI + institutionKey + '/events?page=' + page + "&limit=" + LIMIT);
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

        service.getMonths = function getMonths() {
            return HttpService.get('app/utils/months.json');
        };

        service.addFollower = function (eventKey) {
            return HttpService.post(`/api/events/${eventKey}/followers`);
        };

        service.removeFollower = function (eventKey) {
            return HttpService.delete(`/api/events/${eventKey}/followers`);
        };
    });
})();