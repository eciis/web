'use strict';

(describe('Test ProfileController', function() {

    let mdDialog, profileCtrl, scope, createCtrl, state, states;

    const institution = {
        name: 'test-inst',
        key: '12345'
    };

    const user = {
        'name': 'name',
        'email': 'email@email.com',
        'institution_profiles': [],
        'key': '123456789'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($mdDialog, $controller, $rootScope, $state, STATES) {
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        state = $state;
        states = STATES;
        
        createCtrl = function() {
            return $controller('ProfileController', {
                scope: scope,
                user: user.key,
                currentUserKey: user.key,
                institutionKey: institution.key
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
            expect(state.go).toHaveBeenCalledWith(states.CONFIG_PROFILE);
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

        let property, message;

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