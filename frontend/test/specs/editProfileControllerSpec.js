'use strict';

(describe('Test EditProfileController', function() {

    var httpBackend, scope, mdDialog, authService, profileService, editProfileCtrl, createCrtl, userToEdit;

    var institution = {
        name: 'INSTITUTION',
        key: '987654321'
    };

    var user = {
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

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, ProfileService,
        $mdDialog, AuthService, MessageService) {

        httpBackend = $httpBackend;
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'user/edit_profile.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        profileService = ProfileService;
        scope = $rootScope.$new();
        mdDialog = $mdDialog;
        authService = AuthService;

        authService.login(user);

        userToEdit = authService.getCurrentUser();

        createCrtl = function() {
            return $controller('EditProfileController', {
                    scope: scope,
                    institution: institution,
                    user: userToEdit,
                    profileService: profileService,
                    authService: authService,
                    mdDialog: mdDialog,
                    MessageService: MessageService
                });
        };
        editProfileCtrl = createCrtl();
    }));

    describe('edit', function() {
        it('should call editProfile() and save()', function() {
            spyOn(profileService, 'editProfile').and.callThrough();
            spyOn(authService, 'save').and.callThrough();
            httpBackend.expect('PATCH', '/api/user').respond(userToEdit);
            userToEdit.institution_profiles[0].office = 'Developer';
            editProfileCtrl.edit();
            httpBackend.flush();
            expect(profileService.editProfile).toHaveBeenCalled();
            expect(authService.save).toHaveBeenCalled();
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