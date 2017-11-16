'use strict';

(function() {
    var app = angular.module("app");

    app.service("SurveyService", function SurveyService($http, $q) {
        var service = this;

        var SURVEY_URI = "/api/surveyposts/";

        service.vote = function vote(post, options) {
            var deferred = $q.defer();
            $http.post(SURVEY_URI + post.key + '/votes', options).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();