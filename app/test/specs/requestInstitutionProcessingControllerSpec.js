'use strict';

(describe('Test RequestInstitutionProcessingController', function() {

    var requestInvitationService;

    var user = {
        name: 'User Test',
        key: '38972'
    };

    beforeEach(module('app'));
    beforeEach(inject(function($controller, AuthService, RequestInvitationService){
        AuthService.login(user);
    }));
}))();