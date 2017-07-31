'use strict';

(describe('Test AuthService', function() {
    var authService, userService;

    var userTest = {
        name : 'User',
        accessToken: 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk'
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService) {
        authService = AuthService;
        userService = UserService;
    }));

    describe('AuthService  setupUser', function() {

        it('should call authService.setupUser()', function() {
            spyOn(userService, 'load').and.callThrough();

            authService.setupUser(userTest.accessToken);
            var user = authService.getCurrentUser();
            var userLuiz = new User(userTest);

            expect(userService.load).toHaveBeenCalled();
            expect(user).toEqual(userLuiz);
        });
    });

    describe('AuthService user informations', function() {
        beforeEach(function() {
            authService.setupUser(userTest.accessToken);
        });

        it('should authService.getCurrentUser()', function() {
            var user = authService.getCurrentUser();
            var userLuiz = new User(userTest);
            expect(user).toEqual(userLuiz);
        });

        it('should authService.getUserToken()', function() {
            var userToken = authService.getUserToken();
            expect(userToken).toEqual(userTest.accessToken);
        });

        it('should authService.isLoggedIn()', function() {
            var isLoggedIn = authService.isLoggedIn();
            expect(isLoggedIn).toEqual(true);
        });

        it('should authService.save()', function() {
            window.sessionStorage.userInfo = null;
            authService.save();
            var userCache = window.sessionStorage.userInfo;
            var luizCache = JSON.stringify(userTest);

            expect(userCache).toEqual(luizCache);
        });
    });
}));