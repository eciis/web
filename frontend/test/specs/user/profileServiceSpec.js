'use strict';

(describe('Test ProfileService', function() {

    const USER_URI = '/api/user';
    let mdDialog, profileService, httpService, scope, 
        authService, q, messageService, userService;
    
    let user, institution;

    const setupModels = () => {
        user = new User({
            key: 'user-key'
        });

        institution = new Institution({
            key: 'inst-key'
        });
    };

    beforeEach(module('app'));

    beforeEach(inject(function($mdDialog, ProfileService, HttpService, 
        AuthService, $q, MessageService, $rootScope, UserService) {
        mdDialog = $mdDialog;
        profileService = ProfileService;
        httpService = HttpService;
        authService = AuthService;
        messageService = MessageService;
        scope = $rootScope.$new();
        q = $q;
        userService = UserService;

        setupModels();
        authService.login(user);
    }));

    describe('showProfile()', function() {

        it('should call mdDialog.show()', function() {
            spyOn(mdDialog, 'show');
            var userKey ='pkasdok24Psakd';
            profileService.showProfile(userKey, '$event');
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('editProfile()', () => {
        it('should send a patch request', () => {
            const data = {name: 'anotherName'};
            spyOn(JSON, 'parse').and.returnValue(data);
            spyOn(httpService, 'patch');
            profileService.editProfile(data);
            expect(httpService.patch).toHaveBeenCalledWith(USER_URI, data);
        });
    });

    describe('removeProfile()', () => {
        beforeEach(() => {
            spyOn(authService, 'getCurrentUser').and.returnValue(user);
            spyOn(profileService, '_hasMoreThanOneInstitution').and.returnValue(true);
            spyOn(mdDialog, 'show').and.returnValue(q.when());
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(profileService, '_deleteInstitution');
            spyOn(messageService, 'showToast');
        });
        
        it(`should show a confirm dialog and remove 
        the connection between user and institution `, () => {
            spyOn(profileService, '_isAdmin').and.returnValue(false);
            
            profileService.removeProfile({}, institution);
            scope.$apply();

            expect(profileService._isAdmin).toHaveBeenCalledWith(institution);
            expect(profileService._hasMoreThanOneInstitution).toHaveBeenCalled();
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
            expect(profileService._deleteInstitution).toHaveBeenCalledWith(institution.key);
        });

        it(`should show a confirm dialog and remove 
        the connection between user and institution `, () => {
            spyOn(profileService, '_isAdmin').and.returnValue(true);
            
            profileService.removeProfile({}, institution);

            expect(mdDialog.confirm).not.toHaveBeenCalled();
            expect(mdDialog.show).not.toHaveBeenCalled();
            const msg = 'Desvínculo não permitido. Você é administrador dessa instituição.';
            expect(messageService.showToast).toHaveBeenCalledWith(msg);
        });
    });

    describe('_deleteInstitution', () => {
        it(`should call deleteInstitution and _removeConnection`, () => {
            spyOn(userService, 'deleteInstitution').and.returnValue(q.when());
            spyOn(profileService, '_removeConnection');
            profileService._deleteInstitution(institution.key);
            scope.$apply();

            expect(userService.deleteInstitution).toHaveBeenCalledWith(institution.key);
            expect(profileService._removeConnection).toHaveBeenCalledWith(institution.key);
        });
    });

    describe('_removeConnection', () => {
        it("should save the user modifications if it has more than one institution", () => {
            spyOn(profileService, '_hasMoreThanOneInstitution').and.returnValue(true);
            spyOn(authService, 'save');

            profileService._removeConnection(institution.key);

            expect(authService.save).toHaveBeenCalled();
        })

        it("should logout the user if it does not have more than one institution", () => {
            spyOn(profileService, '_hasMoreThanOneInstitution').and.returnValue(false);
            spyOn(authService, 'logout');

            profileService._removeConnection(institution.key);

            expect(authService.logout).toHaveBeenCalled();
        })
    });
}));