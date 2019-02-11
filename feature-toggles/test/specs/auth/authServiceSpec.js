'use strict';

(describe('Test AuthService', function() {
    let authService, userService, userFactory, scope;

    let userTest = {
        name : 'User',
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        emailVerified: true
    };

    let firebaseUser = {
        accessToken: 'ruioewyuirywieuryiuweyr876324875632487yiue',
        getIdToken: async () => firebaseUser.accessToken
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService, UserFactory, $rootScope) {
        authService = AuthService;
        userService = UserService;
        userFactory = UserFactory;
        scope = $rootScope.$new();
        
        firebase.auth = () => {
            return {
                onAuthStateChanged: (callback) => callback(firebaseUser),
                signOut: function signOut() {}
            };
        };

        firebase.auth.GoogleAuthProvider = function GoogleAuthProvider() {};
        authService.useOriginalGetUserToken();
    }));

    describe('AuthService  setupUser', function() {

        it('should be config user with firebase token', function() {
            spyOn(userService, 'load').and.callThrough();

            authService.setupUser(userTest.accessToken, userTest.emailVerified);
            const user = authService.getCurrentUser();
            const new_user = new userFactory.user(userTest);

            expect(userService.load).toHaveBeenCalled();
            expect(user).toEqual(new_user);
        });
    });

    describe('AuthService user informations', function() {

        describe('test getCurrentUser', function() {
            it('should be return user logged', function() {
                spyOn(userService, 'load').and.callThrough();
                authService.setupUser(userTest.accessToken, userTest.emailVerified);
                const user = authService.getCurrentUser();
                const new_user = new userFactory.user(userTest);
                expect(user).toEqual(new_user);
            });
        });
        
        describe('test getUserToken', function() {
            it('should be return actualized user token', function(done) {
                spyOn(authService, 'save');
                const user = {
                    accessToken: firebaseUser.accessToken,
                    getIdToken: async () => user.accessToken
                };

                authService._getIdToken(user);
                authService.getUserToken().then(userToken => {
                    expect(userToken).toEqual(firebaseUser.accessToken);
                    expect(authService.save).toHaveBeenCalled();
                    done();
                });

                scope.$apply();
            });
        });

        describe('test isLoggedIn', function() {
            it('should br return true', function() {
                const isLoggedIn = authService.isLoggedIn();
                expect(isLoggedIn).toEqual(true);
            });

            it('should br return false', function() {
                authService.logout();
                const isLoggedIn = authService.isLoggedIn();
                expect(isLoggedIn).toEqual(false);
            });
        });

        describe('test save', function() {
            it('should be saev user in localStorage', function() {
                spyOn(userService, 'load').and.callThrough();
                authService.setupUser(userTest.accessToken, userTest.emailVerified);
    
                window.localStorage.userInfo = null;
                authService.save();
                const userCache = window.localStorage.userInfo;
                const new_user = JSON.stringify(userTest);
    
                expect(userCache).toEqual(new_user);
            });
        });
    });

    describe('_getIdToken', function() {
        beforeEach(function() {
            authService.setupUser(userTest.accessToken);
            authService.resolveTokenPromise = () => {};
            spyOn(authService, 'resolveTokenPromise').and.callFake(() => {});
        });

        it('should refresh token when the request of new token is successful', function(done) {
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

        it('should refresh token when the request of new token fail', function(done) {
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