'use strict';

(fdescribe('Test ProfileService', function() {

    const USER_URI = '/api/user';
    let mdDialog, profileService, httpService, scope, 
        authService, deferred, messageService;
    
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
        AuthService, $q, MessageService, $rootScope) {
        mdDialog = $mdDialog;
        profileService = ProfileService;
        httpService = HttpService;
        authService = AuthService;
        messageService = MessageService;
        scope = $rootScope.$new();
        deferred = $q.defer();

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
            spyOn(mdDialog, 'show').and.returnValue(deferred.promise);
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(profileService, '_deleteInstitution');
            spyOn(messageService, 'showToast');
        });
        
        it(`should show a confirm dialog and remove 
        the conection between user and institution `, () => {
            spyOn(user, 'isAdmin').and.returnValue(false);
            
            deferred.resolve();
            profileService.removeProfile({}, institution);
            scope.$apply();

            expect(profileService._hasMoreThanOneInstitution).toHaveBeenCalled();
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
            expect(profileService._deleteInstitution).toHaveBeenCalledWith(institution.key);
        });
    });
}));