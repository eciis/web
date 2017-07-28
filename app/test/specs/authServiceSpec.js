'use strict';

(describe('Test AuthService', function() {
    var authService, userService;

    var luiz = {
        name : 'Luiz'
    };

    beforeEach(module('app'));

    beforeEach(inject(function(AuthService, UserService) {
        authService = AuthService;
        userService = UserService;
    }));
}));