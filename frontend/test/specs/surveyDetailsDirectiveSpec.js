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
                    'number_votes' : 0,
                    'key': 12345
                    };

    var shared_post = {
            'title': 'shared post',
            'shared_post': survey,
            'key': 54321
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
        surveyCtrl.posts = [survey,shared_post];
        surveyCtrl.reloadPost = () => {};

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
            spyOn(surveyCtrl, 'voteService').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(survey);
                    }
                }
            });
        });

        it('should called voteService', function(done) {
            surveyCtrl.binaryOptionSelected = options[0];
            surveyCtrl.vote("$event").then(function() {
                expect(surveyCtrl.voteService).toHaveBeenCalled();
                done();
            });
            scope.$apply();
        });
    });

    describe('voteService()', function() {
        var promise;
        beforeEach(function() {
            spyOn(surveyService, 'vote').and.callThrough();
            surveyCtrl.optionsSelected = [options[0]];
            spyOn(surveyCtrl.posts, 'map');
            httpBackend.expect('POST', "/api/surveyposts/" + surveyCtrl.post.key + '/votes').
                respond(surveyCtrl.post);
            promise = surveyCtrl.voteService();
        });

        it('should added vote in option', function(done) {
            promise.should.be.fulfilled.then(function() {
                expect(surveyService.vote).toHaveBeenCalledWith(survey, surveyCtrl.optionsSelected);
                expect(surveyCtrl.post.options[0].number_votes).toEqual(1);
                expect(surveyCtrl.post.options[0].voters[0].key).toContain(surveyCtrl.user.key);
            }).should.notify(done);
            httpBackend.flush();
            scope.$apply();
        });

        it('should call map in timeline posts', function(done) {
            promise.should.be.fulfilled.then(function() {
                expect(surveyCtrl.posts.map()).toHaveBeenCalled();
            }).should.notify(done);
            httpBackend.flush();
            scope.$apply();
        });

        it('should added vote in shared_post', function(done) {
            surveyCtrl.post.options[0].number_votes = 0;
            promise.should.be.fulfilled.then(function() {
                expect(shared_post.shared_post.options[0].number_votes).toEqual(1);
            }).should.notify(done);
            httpBackend.flush();
            scope.$apply();
        });
    });

    describe('timeHasBeenExpired()', function() {

        it('Should be true if current time is bigger than deadline', function() {
            surveyCtrl.post.deadline = new Date();
            surveyCtrl.post.deadline.setHours(surveyCtrl.post.deadline.getHours() - 1);
            expect(surveyCtrl.timeHasBeenExpired()).toBeTruthy();
        });

        it('Should be false if current time is lower than deadline', function() {
            surveyCtrl.post.deadline = new Date();
            surveyCtrl.post.deadline.setHours(surveyCtrl.post.deadline.getHours() + 20);
            expect(surveyCtrl.timeHasBeenExpired()).toBeFalsy();
        });
    });

    describe('limitString()', function () {
        it('should call limitString', function () {
            spyOn(Utils, 'limitString').and.callThrough();
            const result = surveyCtrl.limitString('Test string', 5);
            expect(_.size(result)).toEqual(9);
            expect(Utils.limitString).toHaveBeenCalled();
        });
    });
}));