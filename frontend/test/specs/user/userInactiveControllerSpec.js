'use strict';

(describe('Test UserInactiveController', function() {

    let userInactiveCtrl, state, authService;

    const institution = {
        name: 'institution',
        key: 'inst-key'
    };

    const user = {
        name: 'User',
        key: 'user-key',
        email: 'user@email',
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $state, AuthService) {
        state = $state;
        authService = AuthService;

        AuthService.login(user);

        userInactiveCtrl =  $controller('UserInactiveController');
    }));

    describe('UserInactiveController functions', function() {

        describe('logout()', function() {
            it('Should call AuthService.logout()', function() {
                spyOn(authService, 'logout');
                userInactiveCtrl.logout();
                expect(authService.logout).toHaveBeenCalled();
            });
        });

        describe('hasInstSelected()', function() {
            it('Should be true when the institution was selected', function() {
                userInactiveCtrl.onSelect(institution);
                expect(userInactiveCtrl.hasInstSelected()).toBeTruthy();
            });

            it('Should be true when the institution was selected', function() {
                expect(userInactiveCtrl.selectedInst).toEqual({});
                expect(userInactiveCtrl.hasInstSelected()).toBeFalsy();
            });
        });

        describe('onSelect()', function(){
            it('Should select the institution', function(){
                expect(userInactiveCtrl.selectedInst).toEqual({});
                userInactiveCtrl.onSelect(institution);
                expect(userInactiveCtrl.selectedInst).toEqual(institution);
            });
        });

        describe('onSearch()', function(){
            it('Should clear the selected institution', function(){
                userInactiveCtrl.onSelect(institution);
                expect(userInactiveCtrl.selectedInst).toEqual(institution);
                userInactiveCtrl.onSearch();
                expect(userInactiveCtrl.selectedInst).toEqual({});
            });
        });

        describe('advance()', function(){
            it('Should go the state user_request', function(){
                spyOn(state, 'go');
                userInactiveCtrl.onSelect(institution);
                userInactiveCtrl.advance();
                expect(state.go).toHaveBeenCalledWith("user_request", { institution: institution })
            });
        });
    });
}));