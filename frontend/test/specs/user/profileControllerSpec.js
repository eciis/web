'use strict';

(describe('Test ProfileController', function() {

    var mdDialog, profileCtrl, scope, createCtrl, state;

    var user = {
        'name': 'name',
        'email': 'email@email.com',
        'institution_profiles': [],
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

    describe('goToConfigProfile()', function() {

        beforeEach(function() {
            spyOn(mdDialog, 'cancel');
            spyOn(state, 'go');
            profileCtrl.goToConfigProfile();
        });

        it('should call state.go()', function() {
            expect(state.go).toHaveBeenCalledWith('app.user.config_profile');
        });

        it('should call mdDialog.cancel()', function() {
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('isOwnProfile()', function() {

        it('should be true', function() {
            expect(profileCtrl.isOwnProfile()).toBeTruthy();
        });
    });

    describe('isToShow()', function() {
        beforeEach(function() {
            profileCtrl.user = user;  
        });

        it('should be false when user not has profile', function() {
            expect(profileCtrl.isToShow()).toBeFalsy();
        });

        it('should be true when user has profile', function() {
            profileCtrl.user.institution_profiles.push({'example_profile': 'example_profile'});
            expect(profileCtrl.isToShow()).toBeTruthy();
        });
    });

    describe('showProperty()', function() {

        var property, message;

        beforeEach(function() {
             property = null;
             message = "Não informado";
        });

        it('the return should be message: "Não informado"', function() {
            expect(profileCtrl.showProperty(property)).toEqual(message);
        });

        it('the return should be the property', function() {
            property = 'Employee';
            expect(profileCtrl.showProperty(property)).toEqual(property);
        });
    });
}));