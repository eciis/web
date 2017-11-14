'use strict';

(describe('Test SurveyDetailsDirective', function() {
    beforeEach(module('app'));

    var surveyCtrl, post, httpBackend, scope, deffered, mdDialog, rootScope, surveyService, mdToast, http;
    var user = {
        name: 'name',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        key: '12345'
    };

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
                    'number_votes' : 0
                    };

    beforeEach(inject(function($controller, $httpBackend, $http, $q, $mdDialog,
            SurveyService, AuthService, $rootScope) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        mdDialog = $mdDialog;
        surveyService = SurveyService;
        http = $http;
        AuthService.login(user);

        surveyCtrl = $controller('SurveyDetailsController', {
            scope: scope,
            $rootScope: rootScope,
            $scope: scope
        });

        surveyCtrl.user = user;
        surveyCtrl.post = survey;
        surveyCtrl.posts = [];

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('vote()', function(){
        beforeEach(function() {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(surveyCtrl, 'voteService');
        });

        it('should called voteService', function() {
            surveyCtrl.optionsSelected = [options[0]];
            surveyCtrl.vote("$event");
            expect(surveyCtrl.voteService).toHaveBeenCalled();
            scope.$apply();
        });
    });

    describe('voteService()', function(){
        it('should added vote in option', function(done) {
            spyOn(surveyService, 'vote').and.callThrough();
            surveyCtrl.optionsSelected = [options[0]];

            httpBackend.expect('POST', "/api/surveyposts/" + surveyCtrl.post.key + '/votes').
                respond(surveyCtrl.optionsSelected);
            var promise = surveyCtrl.voteService();
            promise.should.be.fulfilled.then(function() {
                expect(surveyService.vote).toHaveBeenCalledWith(surveyCtrl.post, surveyCtrl.optionsSelected);
                expect(surveyCtrl.post.options[0].number_votes).toEqual(1);
                expect(surveyCtrl.post.options[0].voters).toContain(surveyCtrl.user.key);
            }).should.notify(done);
            httpBackend.flush();
            scope.$apply();
        });
    });
}));