"use strict";

describe('ManageInstMenuController', () => {

    let manageInstItemsFactory, manageInstMenuCtrl, 
        user, instA, instB, profileA, profileB;
   
    const initModels = () => {
        instA = new Institution({
            key: "instA-key",
            name: "instA"
        });

        instB = new Institution({
            key: "instB-key",
            name: "instB"
        });

        profileA = {
            institution: instA,
            institution_key: instA.key
        };

        profileB = {
            institution: instB,
            institution_key: instB.key
        };

        user = new User({
            key: "user-key",
            institution_profiles: [profileA, profileB],
            current_institution: instA,
            institutions_admin: [
                `http://localhost/api/key/${instA.key}`,
                `http://localhost/api/key/${instB.key}`,
            ]
        })
    };

    beforeEach(module("app"));

    beforeEach(inject(function(AuthService, ManageInstItemsFactory, $controller) {
        manageInstItemsFactory = ManageInstItemsFactory;
        initModels();
        AuthService.login(user);
        manageInstMenuCtrl = $controller("ManageInstMenuController");
        manageInstMenuCtrl.$onInit();
    }));

    describe('onInit()', () => {
        it('should load the institution and the switchInstOption', () => {
            spyOn(manageInstMenuCtrl, '_loadSwitchInstOptions');
            spyOn(manageInstMenuCtrl, '_loadInstitution');
            manageInstMenuCtrl.$onInit();
            expect(manageInstMenuCtrl._loadSwitchInstOptions).toHaveBeenCalled();
            expect(manageInstMenuCtrl._loadInstitution).toHaveBeenCalled();
        });
    });

    describe('_loadInstitution()', () => {
        it('should set the institution and load the menu options', () => {
            spyOn(manageInstMenuCtrl, '_loadMenuOptions');
            manageInstMenuCtrl._loadInstitution();
            expect(manageInstMenuCtrl.institution).toBe(instA);
            expect(manageInstMenuCtrl._loadMenuOptions).toHaveBeenCalled();
        });
    });

    describe('_loadMenuOptions()', () => {
        it('should call the ManageInstItemsFactory getItems function', () => {
            spyOn(manageInstItemsFactory, 'getItems').and.callThrough();
            manageInstMenuCtrl._loadMenuOptions();
            expect(manageInstItemsFactory.getItems).toHaveBeenCalledWith(manageInstMenuCtrl.institution);
        });
    });

    describe('_getIcon()', () => {
        it('should return the radio_button_checked icon', () => {
            expect(manageInstMenuCtrl._getIcon(instA.key)).toBe('radio_button_checked');
        });

        it('should return the radio_button_unchecked icon', () => {
            expect(manageInstMenuCtrl._getIcon(instB.key)).toBe('radio_button_unchecked');
        });
    });

    describe('_switchInstitution()', () => {
        it('should have called changeInstitution and _loadInstitution', () => {
            spyOn(manageInstMenuCtrl.user, 'changeInstitution');
            spyOn(manageInstMenuCtrl, '_loadInstitution');
            manageInstMenuCtrl._switchInstitution(instB);
            expect(manageInstMenuCtrl.user.changeInstitution).toHaveBeenCalledWith(instB);
            expect(manageInstMenuCtrl._loadInstitution).toHaveBeenCalled();
        });
    });

    describe('_getProfilesAdmin()', () => {
        it(`should return just the profiles in which the user is admin
            of the correspondent institution`, () => {
            const instC = new Institution({key: 'instC'});
            const profileC = {institution: instC, institution_key: instC.key};
            manageInstMenuCtrl.user.institution_profiles.push(profileC);
            expect(manageInstMenuCtrl.user.institution_profiles).toEqual([profileA, profileB, profileC]);
            expect(manageInstMenuCtrl._getProfilesAdmin()).toEqual([profileA, profileB]);
        });
    });

});