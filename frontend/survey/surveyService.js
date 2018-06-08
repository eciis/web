'use strict';

(function() {
    var app = angular.module("app");

    app.service("SurveyService", function SurveyService(HttpService, $q) {
        var service = this;

        var SURVEY_URI = "/api/surveyposts/";

        service.vote = function vote(post, options) {
            return HttpService.post(SURVEY_URI + post.key + '/votes', options);
        };
    });
})();