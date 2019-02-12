'use strict';

(describe('Test ColorPickerController', function() {
    beforeEach(module('app'));

    var colorPickerCtrl, scope, httpBackend, mdDialog, http, profileService, rootScope;

    var institution = {
        'email' : 'institution@gmail.com',
        'key': '123456',
        'institution_key' : '123456'
    };

    var colors = [{'value' : 'red'}, {'value':'purple'}, {'value':'blue'}];

    var user = {
        'name' : 'user',
        'key': '12345',
        'state' : 'active',
        'institution_profiles': [institution],
        'current_institution' : institution
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

        it('Should return true', function(done) {
            var change = {
                'color' : 'blue',
                'email' : 'institution@gmail.com',
                'key': '123456',
                'institution_key' : '123456'
            };
            colorPickerCtrl.newProfile = change;
            colorPickerCtrl.newUser.institution_profiles = [change];

            httpBackend.expect('PATCH', '/api/user').respond(200);
            var promise = colorPickerCtrl.saveColor();
            promise.should.be.fulfilled.then(function() {
                expect(colorPickerCtrl.user.getProfileColor()).toBe('blue');
                expect(colorPickerCtrl.user.institution_profiles).toHaveBeenCalled(change);
            }).should.notify(done);
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