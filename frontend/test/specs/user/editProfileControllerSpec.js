'use strict';

(describe('Test EditProfileController', function() {

    let scope, mdDialog, authService, profileService, messageService, q,
        editProfileCtrl, observerRecorderService, userToEdit;

    let institution, user, profile;

    const setupModels = () => {
        institution = {
            name: 'INSTITUTION',
            key: '987654321'
        };
    
        user = {
            name: 'User',
            email: 'teste@gmail',
            institutions: [institution],
            institution_profiles: [{
                    office: 'developer',
                    phone: '(99) 99999-9999',
                    email: 'teste@gmail.com',
                    institution_key: institution.key
                }],
            state: 'active'
        };

        profile = {
            office: 'member',
            email: user.email,
            institution: institution
        };
    }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, ProfileService,
        $mdDialog, AuthService, MessageService, ObserverRecorderService, $q) {

        profileService = ProfileService;
        scope = $rootScope.$new();
        mdDialog = $mdDialog;
        q = $q;
        authService = AuthService;
        observerRecorderService = ObserverRecorderService;
        messageService = MessageService;

        setupModels();
        authService.login(user);
        userToEdit = authService.getCurrentUser();

        editProfileCtrl = $controller('EditProfileController', {
            scope: scope,
            profile: profile,
            institution: institution,
            user: userToEdit,
            profileService: profileService,
            authService: authService,
            mdDialog: mdDialog,
            MessageService: MessageService
        });
        editProfileCtrl.$onInit();
    }));

    describe('onInit()', () => {
        it('should set user, profile and observer', () => {
            spyOn(authService, 'getCurrentUser').and.returnValue(user);
            spyOn(observerRecorderService, 'register');
            
            editProfileCtrl.$onInit();

            expect(editProfileCtrl.user).toBe(user);
            expect(editProfileCtrl.profile).toBe(profile);
            expect(observerRecorderService.register).toHaveBeenCalledWith(editProfileCtrl.user);
        });
    });

    describe('getIntName()', () => {
        it('should call limitString', () => {
            spyOn(Utils, 'limitString');
            editProfileCtrl.getInstName();
            expect(Utils.limitString).toHaveBeenCalledWith(profile.institution.name, 67);
        });
    });

    describe('edit', function() {
        it('should call editProfile() and save()', function() {
            const patch = {...profile, office: 'developer'};
            spyOn(observerRecorderService, 'generate').and.returnValue(patch);
            spyOn(profileService, 'editProfile').and.returnValue(q.when());
            spyOn(authService, 'save');
            spyOn(messageService, 'showInfoToast');
            spyOn(mdDialog, 'hide');

            editProfileCtrl.edit();
            scope.$apply();

            expect(observerRecorderService.generate).toHaveBeenCalled();
            expect(profileService.editProfile).toHaveBeenCalledWith(patch);
            expect(messageService.showInfoToast).toHaveBeenCalledWith('Perfil editado com sucesso');
            expect(authService.save).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('should not call editProfile() if there is no alterations', function() {
            const patch = {};
            spyOn(observerRecorderService, 'generate').and.returnValue(patch);
            spyOn(profileService, 'editProfile');
            spyOn(mdDialog, 'hide');

            editProfileCtrl.edit();

            expect(observerRecorderService.generate).toHaveBeenCalled();
            expect(profileService.editProfile).not.toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('should show a message when the edited profile is invalid', () => {
            editProfileCtrl.profile.office = undefined;
            spyOn(observerRecorderService, 'generate');
            spyOn(profileService, 'editProfile');
            spyOn(messageService, 'showErrorToast');

            editProfileCtrl.edit();

            expect(observerRecorderService.generate).not.toHaveBeenCalled();
            expect(profileService.editProfile).not.toHaveBeenCalled();
            expect(messageService.showErrorToast).toHaveBeenCalledWith('O cargo é obrigatório.');
        });
    });

    describe('removeProfile()', () => {
        it('should call the removeProfile function from ProfileService', () => {
            spyOn(profileService, 'removeProfile');
            const event = {};
            editProfileCtrl.removeProfile(event);
            expect(profileService.removeProfile).toHaveBeenCalledWith(event, editProfileCtrl.profile.institution);
        });
    });

    describe('closeDialog', function() {
        it('should call hide()', function() {
            spyOn(mdDialog, 'hide');
            editProfileCtrl.closeDialog();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
}));