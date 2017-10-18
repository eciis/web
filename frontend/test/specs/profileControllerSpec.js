'use strict';

(describe('Test ProfileController', function() {

    var mdDialog, profileCtrl, scope, createCtrl, state;

    var user = {
        'name': 'name',
        'email': 'email@email.com',
        'key': '123456789'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($mdDialog, $controller, $rootScope, $state) {
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        state = $state;
        createCtrl = function() {
            return $controller('ProfileController', {
                scope: scope,
                user: user.key,
                currentUserKey: user.key
            });
        };
        profileCtrl = createCtrl();
    }));

    describe('isOwnProfile()', function() {

        it('should be true', function() {
            expect(profileCtrl.isOwnProfile()).toBeTruthy();
        });
    });

    describe('goToConfigProfile()', function() {

        beforeEach(function() {
            spyOn(mdDialog, 'cancel');
            spyOn(state, 'go');
            profileCtrl.goToConfigProfile();
        });

        it('should call state.go()', function() {
            expect(state.go).toHaveBeenCalledWith('app.config_profile');
        });

        it('should call mdDialog.cancel()', function() {
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });
}));