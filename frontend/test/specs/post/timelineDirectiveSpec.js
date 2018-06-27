'use strict';

(describe('Test TimelineController', function() {
    beforeEach(module('app'));

    var timelineCtrl, httpBackend, createController, rootScope;
    var user = {
        name: 'name',
        key : 'key',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        permissions: {}
    };

    var post = {
        title: 'post principal',
        author_key: user.key,
        institution_key: "institution_key",
        key: "123456",
        state: 'published'
    };

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
                    'options' : options
                    };

    var posts = [];

    beforeEach(inject(function($controller, $httpBackend, AuthService, $rootScope) {
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        AuthService.login(user);

        spyOn(Utils, 'setScrollListener').and.callFake(function() {});

        createController = function(){
            return $controller('TimelineController', {
                $rootScope: rootScope
            });
        }

        timelineCtrl = createController();

        timelineCtrl.user = new User(user);
        timelineCtrl.posts = [];

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Should create observer', function() {
        it('should call root scope to create observer', function() {
            spyOn(rootScope, '$on').and.callThrough();
            timelineCtrl = createController();
            expect(rootScope.$on).toHaveBeenCalled();
        });
    });
}));