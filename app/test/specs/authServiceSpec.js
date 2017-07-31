'use strict';

(describe('Test AuthService', function() {
    var authService, userService, window;

    var luiz = {
        name : 'Luiz',
        accessToken: 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk'
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService, $window) {
        authService = AuthService;
        userService = UserService;
        window = $window;

        UserService.load = function() {
            return {
                then: function(callback) {
                    return callback(luiz);
                }
            };
        };
    }));

    describe('AuthService  setupUser', function() {

        it('should call authService.setupUser()', function() {
            spyOn(userService, 'load').and.callThrough();

            authService.setupUser(luiz.accessToken);
            var user = authService.getCurrentUser();
            var userLuiz = new User(luiz);

            expect(userService.load).toHaveBeenCalled();
            expect(user).toEqual(userLuiz);
        });
    });

    describe('AuthService user informations', function() {
        beforeEach(function() {
            authService.setupUser(luiz.accessToken);
        });

        it('should authService.getCurrentUser()', function() {
            var user = authService.getCurrentUser();
            var userLuiz = new User(luiz);
            expect(user).toEqual(userLuiz);
        });

        it('should authService.getUserToken()', function() {
            var userToken = authService.getUserToken();
            expect(userToken).toEqual(luiz.accessToken);
        });

        it('should authService.isLoggedIn()', function() {
            var isLoggedIn = authService.isLoggedIn();
            expect(isLoggedIn).toEqual(true);
        });

        it('should authService.save()', function() {
            window.sessionStorage.userInfo = null;
            authService.save();
            var userCache = window.sessionStorage.userInfo;
            var luizCache = JSON.stringify(luiz);

            expect(userCache).toEqual(luizCache);
        });
    });
}));