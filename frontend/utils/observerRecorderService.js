'use strict';

(function() {
    var app = angular.module('app');

    app.service('ObserverRecorderService', function() {
        let service = this;
        let observers = [];

        service.register = function register(object) {
            const observer = jsonpatch.observe(object);
            observers.push(observer);
            return observer;
        };

        service.generate = function generate(observer) {
            return jsonpatch.generate(observer);
        };

        service.unobserve = function unobserve(observer) {
            jsonpatch.unobserve(observer);
        };

        service.unobserveAll = function unobserveAll() {
            observers.map(observer => observer.unobserve());
            observers = [];
        };
    });
})();