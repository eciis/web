'use strict';

(describe('Test AuthService', function() {
    var authService, userService;

    var userTest = {
        name : 'User',
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        emailVerified: true
    };

    var firebaseUser = {
        accessToken: 'ruioewyuirywieuryiuweyr876324875632487yiue',
        getIdToken: async () => firebaseUser.accessToken
    }

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService) {
        authService = AuthService;
        userService = UserService;
        
        firebase.auth = () => {
            return {
                onAuthStateChanged: (callback) => callback(firebaseUser),
                signOut: function signOut() {}
            };
        }

        firebase.auth.GoogleAuthProvider = function GoogleAuthProvider() {};
        authService.useOriginalGetUserToken();
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
            spyOn(authService, 'save');
            authService.getUserToken().then(userToken => {
                expect(userToken).toEqual(firebaseUser.accessToken);
                expect(authService.save).toHaveBeenCalled();
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

    describe('_getIdToken', function() {
        beforeEach(function() {
            authService.setupUser(userTest.accessToken);
            authService.resolveTokenPromise = () => {};
            spyOn(authService, 'resolveTokenPromise').and.callFake(() => {});
        });

        it('should refresh token', function(done) {
            const user = {
                accessToken: "riuewyirouyweiuryiu21y3iuyiuwyeiudsjikahkjsah",
                getIdToken: async () => user.accessToken
            };
            const savedResolveTokenPromisse = authService.resolveTokenPromise;

            authService._getIdToken(user).then(function(accessToken) {
                expect(accessToken).toEqual(user.accessToken);
                expect(savedResolveTokenPromisse).toHaveBeenCalled();
                done();
            });
        });

        it('should return actual token', function(done) {
            const user = {
                accessToken: "riuewyirouyweiuryiu21y3iuyiuwyeiudsjikahkjsah",
                getIdToken: async () => {throw "Network error!"}
            };
            const savedResolveTokenPromisse = authService.resolveTokenPromise;

            authService._getIdToken(user).then(function(accessToken) {
                expect(accessToken).toEqual(firebaseUser.accessToken);
                expect(savedResolveTokenPromisse).toHaveBeenCalled();
                done();
            });
        });
    });
}));