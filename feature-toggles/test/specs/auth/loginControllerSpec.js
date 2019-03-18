'use strict';

(describe('Test LoginController', function() {

    let logginCtrl, httpBackend, scope, createCtrl, state, authService, states, q, messageService;

    const user = {
        name: 'Tiago',
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, STATES, $state, AuthService, $q, MessageService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        states = STATES;
        authService = AuthService;
        q = $q;
        messageService = MessageService;

        authService.login(user);

        spyOn(authService, 'isLoggedIn').and.callThrough();
        httpBackend.when('GET', '/signin').respond(200);

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
            spyOn(state, 'go').and.callThrough();
            logginCtrl.$onInit();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith(states.MANAGE_FEATURES);
        });

        it('should not call state.go if user is not loggedIn', function() {
            authService.logout();
            spyOn(state, 'go').and.callThrough();
            logginCtrl.$onInit();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).not.toHaveBeenCalled();
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

    describe('test loginWithGoogle', function() {
        it('Should be call state.go if login is successful', function(done) {
            spyOn(authService, 'loginWithGoogle').and.callFake(function() {
                return q.when();
            });
            spyOn(state, 'go');

            logginCtrl.loginWithGoogle().then(function() {
                expect(authService.loginWithGoogle).toHaveBeenCalled();
                expect(state.go).toHaveBeenCalled();
                done();
            });

            scope.$apply();
        });

        it('Should be call messageService.showErrorToast if login is not successful', function(done) {
            spyOn(authService, 'loginWithGoogle').and.callFake(function() {
                return q.reject('Login failed');
            });
            spyOn(messageService, 'showErrorToast');

            logginCtrl.loginWithGoogle().then(function() {
                expect(authService.loginWithGoogle).toHaveBeenCalled();
                expect(messageService.showErrorToast).toHaveBeenCalledWith('Login failed');
                done();
            });

            scope.$apply();
        });
    });

    describe('test loginWithEmailPassword', function() {
        it('Should be call state.go if login is successful', function(done) {
            spyOn(authService, 'loginWithEmailAndPassword').and.callFake(function() {
                return q.when();
            });
            spyOn(state, 'go');

            logginCtrl.loginWithEmailPassword().then(function() {
                expect(authService.loginWithEmailAndPassword).toHaveBeenCalledWith(logginCtrl.user.email, logginCtrl.user.password);
                expect(state.go).toHaveBeenCalled();
                done();
            });

            scope.$apply();
        });

        it('Should be call messageService.showErrorToast if login is not successful', function(done) {
            spyOn(authService, 'loginWithEmailAndPassword').and.callFake(function() {
                return q.reject('Login failed');
            });
            spyOn(messageService, 'showErrorToast');

            logginCtrl.loginWithEmailPassword().then(function() {
                expect(authService.loginWithEmailAndPassword).toHaveBeenCalledWith(logginCtrl.user.email, logginCtrl.user.password);
                expect(messageService.showErrorToast).toHaveBeenCalledWith('Login failed');
                done();
            });

            scope.$apply();
        });
    });
}));