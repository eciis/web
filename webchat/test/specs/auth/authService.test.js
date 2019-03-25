'use strict';

(describe('Test AuthService', function() {
    let authService, userService, userClass;

    const userTest = {
        name : 'User',
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        emailVerified: true
    };

    const firebaseUser = {
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        getIdToken: async () => firebaseUser.accessToken
    }

    beforeEach(module('webchat'));

    beforeEach(inject((AuthService, UserService, User) => {
        authService = AuthService;
        userService = UserService;
        userClass = User;

        firebase.auth = () => {
            return {
                onAuthStateChanged: callback => callback(firebaseUser),
                signOut: function signOut() {}
            };
        }

        firebase.auth.GoogleAuthProvider = function GoogleAuthProvider() {};
        AuthService.useOriginalGetUserToken();
    }));

    describe('AuthService  setupUser', function() {

        it('should call authService.setupUser()', function() {
            spyOn(userService, 'load').and.callThrough();

            authService.setupUser(userTest.accessToken, userTest.emailVerified);
            const user = authService.getCurrentUser();
            const new_user = new userClass(userTest);

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
            const user = authService.getCurrentUser();
            const new_user = new userClass(userTest);
            expect(user).toEqual(new_user);
        });

        it('should authService.getUserToken()', function(done) {
            spyOn(authService, 'save');
            authService.getUserToken().then(userToken => {
                expect(userToken).toEqual(userTest.accessToken);
                expect(authService.save).toHaveBeenCalled();
                done();
            });
        });

        it('should authService.isLoggedIn()', function() {
            const isLoggedIn = authService.isLoggedIn();
            expect(isLoggedIn).toEqual(true);
        });

        it('should authService.save()', function() {
            spyOn(userService, 'load').and.callThrough();
            authService.setupUser(userTest.accessToken, userTest.emailVerified);

            window.localStorage.userInfo = null;
            authService.save();
            const userCache = window.localStorage.userInfo;
            const new_user = JSON.stringify(userTest);

            expect(userCache).toEqual(new_user);
        });
    });
}));
