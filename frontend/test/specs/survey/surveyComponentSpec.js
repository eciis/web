'use strict';

(describe('Test SurveyComponent', function() {
    beforeEach(module('app'));

    var surveyCtrl, post, httpBackend, scope, deffered, mdDialog, rootScope, postService, mdToast, http, imageService, createCtrl;
    var user = {
        name: 'name',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        permissions: {}
    };
    var option_empty = {'text': '',
                        'number_votes': 0,
                        'voters': []
                        };

    const unprocessed_options =
        [{
            'text': 'Option number 1',
            'number_votes': 0,
            'voters': [] },
        {
            'text': 'Option number 2',
            'number_votes': 0,
            'voters': []
        }];

    var options = [{'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] }];

    var survey = { 'title' : 'The Survey',
                    'type_survey' : 'multiple_choice',
                    'deadline': new Date(),
                    'options': options,
                    'key': 'Akpaosakdsa-snmnzxxjkha3232xaz'
                    };

    beforeEach(inject(function($controller, $httpBackend, $http, $q, $mdDialog,
            PostService, AuthService, $mdToast, $rootScope) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = $http;
        AuthService.login(user);

        surveyCtrl = $controller('SurveyComponentController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            $scope: scope
        });

        surveyCtrl.user = new User(user);
        surveyCtrl.posts = [];
        surveyCtrl.post = survey;

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('onInit', function() {
        beforeEach(function() {
            expect(surveyCtrl.options).toBeFalsy();
        });
        
        it('should set the options surveyCtrl', function() {
            surveyCtrl.$onInit();
            expect(surveyCtrl.options.length > 0).toBeTruthy();
        });
    });

    describe('Save survey', function() {
        it('should create survey post', function(done) {
            spyOn(postService, 'createPost').and.callThrough();
            spyOn(surveyCtrl, 'resetSurvey');
            spyOn(mdDialog, 'hide');

            surveyCtrl.post = survey;
            surveyCtrl.options = options;
            surveyCtrl.multipleChoice = true;
            surveyCtrl.callback = function() {};

            var survey_obj = new Post(surveyCtrl.post, surveyCtrl.user.current_institution.key);
            var date = survey_obj.deadline.toISOString();
            survey_obj.deadline = _.split(date, '.')[0];
            var promise = surveyCtrl.save([]);
            httpBackend.expect('POST', "/api/posts").respond(survey_obj);

            promise.then(function() {
                var user_saved = JSON.parse(window.localStorage.userInfo);
                expect(postService.createPost).toHaveBeenCalledWith(survey_obj);
                expect(surveyCtrl.resetSurvey).toHaveBeenCalled();
                expect(mdDialog.hide).toHaveBeenCalled();
                expect(user_saved.permissions).toEqual({'remove_post': {'Akpaosakdsa-snmnzxxjkha3232xaz': true}});
                done();
            });
            httpBackend.flush();
            scope.$apply();
        });
    });

    describe('resetSurvey()', function() {
        it('should change the current post instance to an empty object', function() {
            surveyCtrl.post = new Post(post, {});
            surveyCtrl.resetSurvey();
            expect(surveyCtrl.post).toEqual({});
        });
    });

    describe('_processOptions', function() {
        it('should remove empty options and add "id" property in other options', () => {
            unprocessed_options.push(option_empty);
            surveyCtrl.options = unprocessed_options;
            surveyCtrl._processOptions();
            expect(surveyCtrl.options).toEqual(options);
        });
    });
}));