'use strict';

(describe('Test SurveyService', function () {
        var httpBackend, service, $http;
        var SURVEY_URI = "/api/surveyposts/";
        var user = {name: 'User', key: 12345};
        var options = [{'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'selected' : true,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] }];

        var survey = { 'title' : 'The Survey',
                    'type_survey' : 'binary',
                    'options' : options,
                    'number_votes' : 0,
                    'key':'123'
                    };

        beforeEach(module('app'));

    beforeEach(inject(function ($httpBackend, SurveyService, HttpService) {
            httpBackend = $httpBackend;
            $http = HttpService;
            service = SurveyService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
        }));

        it('Test vote in success case', function() {
            spyOn($http, 'post').and.callThrough();
            var URI = SURVEY_URI + survey.key + "/votes";
            httpBackend.expect('POST', URI).respond();

            service.vote(survey, [options[0]]);

            expect($http.post).toHaveBeenCalledWith(URI, [options[0]]);
            httpBackend.flush();
        });
}));