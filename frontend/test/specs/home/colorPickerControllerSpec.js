'use strict';

(describe('Test ColorPickerController', function() {
    beforeEach(module('app'));

    var colorPickerCtrl, scope, httpBackend, mdDialog, http, profileService, rootScope;

    var institution = {
        'email' : 'institution@gmail.com',
        'key': '123456',
        'institution_key' : '123456',
        'color' : 'teal',
    };

    const secondInstitution = {
        'email' : 'institution2@gmail.com',
        'key': '1234567',
        'institution_key' : '1234567',
        'color' : 'teal',
    };

    var colors = [{'value' : 'red'}, {'value':'purple'}, {'value':'blue'}];

    var user = {
        'name' : 'user',
        'key': '12345',
        'state' : 'active',
        'institution_profiles': [institution, secondInstitution],
        'current_institution' : institution,
    };

    beforeEach(inject(function ($controller, $httpBackend, HttpService, $mdDialog,
            AuthService, $rootScope, ProfileService) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        http = HttpService;
        profileService = ProfileService;

        colorPickerCtrl = $controller('ColorPickerController', {
                user,
                institution,
            });

        AuthService.login(user);

        httpBackend.when('GET', 'app/home/colors.json').respond(colors);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    describe('saveColor()', function() {
        beforeEach(function() {
            spyOn(profileService, 'editProfile').and.callThrough();
        });

        it('should change first institutions color', function(done) {
            const change = {
                'color' : 'blue',
                'email' : 'institution@gmail.com',
                'key': '123456',
                'institution_key' : '123456'
            };
            colorPickerCtrl.newUser.institution_profiles = [change, secondInstitution];
            const diff = jsonpatch.compare(colorPickerCtrl.user, colorPickerCtrl.newUser);

            httpBackend.expect('PATCH', '/api/user').respond(200);
            const promise = colorPickerCtrl.saveColor();
            promise.should.be.fulfilled.then(function() {
                expect(colorPickerCtrl.user).toEqual(colorPickerCtrl.newUser);
                expect(colorPickerCtrl.user.institution_profiles[0]).toEqual(change);
                expect(profileService.editProfile).toHaveBeenCalledWith(diff);
                done();
            });
            httpBackend.flush();
            scope.$apply();
        });

        it('should change second institutions color', (done) => {
            const change = {
                'color': 'red',
                'email' : 'institution2@gmail.com',
                'key': '1234567',
                'institution_key' : '1234567'
            }

            colorPickerCtrl.newUser.institution_profiles = [institution, change];
            const diff = jsonpatch.compare(colorPickerCtrl.user, colorPickerCtrl.newUser);

            httpBackend.expect('PATCH', '/api/user').respond(200);
            const promise = colorPickerCtrl.saveColor();
            promise.should.be.fulfilled.then(function() {
                expect(colorPickerCtrl.user).toEqual(colorPickerCtrl.newUser);
                expect(colorPickerCtrl.user.institution_profiles[1]).toEqual(change);
                expect(profileService.editProfile).toHaveBeenCalledWith(diff);
                done();
            });
            httpBackend.flush();
            scope.$apply();
        });
    });

    describe('cancelDialog()', function(){
        it('Should call cancel', function() {
            spyOn(mdDialog, 'cancel');
            colorPickerCtrl.cancelDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });
}));