'use strict';

(describe('Test LoginController', function() {

    var logginCtrl, httpBackend, scope, createCtrl, state, authService, states;

    var user = {
        name: 'Tiago',
        state: 'active'
    };

    var institutions = [{
        name: 'Certbio',
        key: '123456789'
    }];

    var posts = [{
        author: 'Mayza Nunes',
        author_key: "111111",
        title: 'Post de Mayza',
        text: 'Lorem ipsum'
    }];

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, STATES, $state, AuthService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        states = STATES;
        authService = AuthService;

        httpBackend.when('GET', "main/main.html").respond(200);

        httpBackend.when('GET', "home/home.html").respond(200);

        authService.login(user);

        spyOn(authService, 'isLoggedIn').and.callThrough();
        spyOn(state, 'go').and.callThrough();

        createCtrl = function() {
            return $controller('LoginController', {
                scope: scope,
                AuthService: authService
            });
        };
        logginCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('main()', function() {

        it('should change state to manage_features if user is loggedIn', function() {
            logginCtrl.$onInit();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith(states.MANAGE_FEATURES);
        });
    });

    describe('isLoadingUser()', function() {
        it('should return true if AuthService.isLoadingUser is true', () => {
            authService.isLoadingUser = true;
            expect(logginCtrl.isLoadingUser()).toBe(true);
        });

        it('should return false if AuthService.isLoadingUser is false', () => {
            authService.isLoadingUser = false;
            expect(logginCtrl.isLoadingUser()).toBe(false);
        });
    });
}));