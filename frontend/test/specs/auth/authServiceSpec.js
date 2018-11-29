'use strict';

(describe('Test AuthService', function() {
    var authService, userService, $q;

    var userTest = {
        name : 'User',
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        emailVerified: true
    };

    var firebaseUser = {
        accessToken: 'gfdfggfdjdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk',
        getIdToken: async () => firebaseUser.accessToken
    }

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService, _$q_) {
        authService = AuthService;
        userService = UserService;
        $q = _$q_;
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

            firebase.auth = () => {
                return {
                    onAuthStateChanged: $q.when(firebaseUser),
                    signOut: function signOut() {}
                };
            }
    
            firebase.auth.GoogleAuthProvider = function GoogleAuthProvider() {};
            authService.useOriginalGetUserToken();
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
                expect(userToken).toEqual(userTest.accessToken);
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
}));