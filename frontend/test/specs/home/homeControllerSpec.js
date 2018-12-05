'use strict';

(describe('Test HomeController', function() {

    let homeCtrl, httpBackend, scope, createCtrl, mdDialog, state, states, http, postService;

    var institutions = [{
        acronym: 'Certbio',
        key: '123456789',
        photo_url: "photo_url"
    }];

    var user = {
        name: 'Tiago',
        key: 'key',
        follows: institutions
    };

    var posts = [{
        author: 'Mayza Nunes',
        author_key: "111111",
        title: 'Post de Mayza',
        text: 'Lorem ipsum'
    }];

    // Event of Splab by Maiana
    var event = {'title': 'Inauguration',
        'text': 'Inauguration of system E-CIS',
        'local': 'Brasilia',
        'photo_url': null,
        'start_time': new Date(),
        'end_time': new Date(),
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope,
            PostService, $mdDialog, $state, AuthService, $http, STATES) {
        httpBackend = $httpBackend;
        http = $http;
        scope = $rootScope.$new();
        mdDialog = $mdDialog;
        state = $state;
        postService = PostService;
        states = STATES;

        httpBackend.when('GET', "/api/events?page=0&limit=15").respond([event]);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET','app/home/colors.json').respond(200);
        
        AuthService.getCurrentUser = function() {
            return new User(user);
        };

        createCtrl = function() {
            return $controller('HomeController', {
                scope: scope
            });
        };

        spyOn($rootScope, '$on').and.callThrough();

        homeCtrl = createCtrl();
        httpBackend.flush();

        expect($rootScope.$on).toHaveBeenCalled();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('HomeController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(homeCtrl.user.name).toEqual('Tiago');
        });

        it('should exist an institution in institutions array', function() {
            expect(homeCtrl.followingInstitutions.length).toBe(1);
        });

        it('should exist an institution with name and key equal Certbio and 123456789, respectively', function() {
            expect(homeCtrl.followingInstitutions[0]).toEqual({
                acronym: 'Certbio', key: '123456789', photo_url: 'photo_url'});
        });

        it('should be false the instMenuExpanded propertie', function() {
            expect(homeCtrl.instMenuExpanded).toBe(false);
        });
    });

    describe('HomeController functions', function() {

        describe('goToInstitution()', function() {

            it('should call state.go()', function() {
                spyOn(state, 'go');
                homeCtrl.goToInstitution('123456789');
                expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, {institutionKey: '123456789'});
            });
        });

        describe('newPost()', function() {

            it('should call mdDialog.show()', function() {
                spyOn(mdDialog, 'show');
                homeCtrl.newPost('$event');
                expect(mdDialog.show).toHaveBeenCalled();
            });
        });

        describe('expandInstMenu()' , function() {

            it('should be true the instMenuExpanded propertie', function() {
                homeCtrl.expandInstMenu();
                expect(homeCtrl.instMenuExpanded).toBe(true);
            });
        });

        describe('eventInProgress()', function() {
            it('Should be true or false the call of eventInProgress', function() {
                var date = new Date();
                date.setYear(3000);
                var event = {end_time: date.toISOString()};
                expect(homeCtrl.eventInProgress(event)).toEqual(true);

                date.setYear(2000);
                event.end_time = date.toISOString();
                expect(homeCtrl.eventInProgress(event)).toEqual(false);
            });
        });
    });
}));