'use strict';

(describe('Test AuthService', function() {
    var authService, userService;

    var userTest = {
        name : 'User',
        accessToken: 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        emailVerified: true
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService) {
        authService = AuthService;
        userService = UserService;
    }));

    describe('AuthService  setupUser', function() {

        it('should call authService.setupUser()', function() {
            spyOn(userService, 'load').and.callThrough();

            authService.setupUser(userTest.accessToken, userTest.emailVerified);
            var user = authService.getCurrentUser();
            var new_user = new User(userTest);

            expect(userService.load).toHaveBeenCalled();
            expect(user).toEqual(new_user);
        });
    });

    describe('AuthService user informations', function() {
        beforeEach(function() {
            authService.setupUser(userTest.accessToken);
        });

        it('should authService.getCurrentUser()', function() {
            spyOn(userService, 'load').and.callThrough();
            authService.setupUser(userTest.accessToken, userTest.emailVerified);
            var user = authService.getCurrentUser();
            var new_user = new User(userTest);
            expect(user).toEqual(new_user);
        });

        it('should authService.getUserToken()', function(done) {
            authService.getUserToken().then(userToken => {
                expect(userToken).toEqual(userTest.accessToken);
                done();
            });
        });

        it('should authService.isLoggedIn()', function() {
            var isLoggedIn = authService.isLoggedIn();
            expect(isLoggedIn).toEqual(true);
        });

        it('should authService.save()', function() {
            spyOn(userService, 'load').and.callThrough();
            authService.setupUser(userTest.accessToken, userTest.emailVerified);

            window.localStorage.userInfo = null;
            authService.save();
            var userCache = window.localStorage.userInfo;
            var new_user = JSON.stringify(userTest);

            expect(userCache).toEqual(new_user);
        });
    });
}));