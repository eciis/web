'use strict';

(fdescribe('Test ConfigProfileController', function() {
    let configCtrl, httpBackend, scope, userService, createCrtl, state, deferred,
    authService, imageService, mdDialog, cropImageService, states, messageService;

    const institution = {
        name: 'institution',
        key: '987654321'
    };

    const other_institution = {
        name: 'other_institution',
        key: '3279847298'
    };

    const user = {
        name: 'User',
        cpf: '121.445.044-07',
        email: 'teste@gmail.com',
        institutions: [institution],
        uploaded_images: [],
        institutions_admin: [],
        state: 'active'
    };

    const newUser = {
        name: 'newUser',
        cpf: '121.115.044-07',
        email: 'teste@gmail.com',
        institutions: [institution],
        institutions_admin: []
    };

    const fakeCallback = response => {
        return () => {
            return {
                then: function(callback) {
                    return callback(response);
                }
            };
        }
    }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, STATES,
        $mdDialog, UserService, AuthService, ImageService, CropImageService, MessageService) {

        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        states = STATES;
        imageService = ImageService;
        mdDialog = $mdDialog;
        deferred = $q.defer();
        userService = UserService;
        cropImageService = CropImageService;
        messageService = MessageService;
        authService = AuthService;

        authService.login(user);

        createCrtl = function() {
            return $controller('ConfigProfileController', {
                    scope: scope,
                    authService: authService,
                    userService: userService,
                    imageService: imageService,
                    cropImageService : cropImageService,
                    messageService: messageService
                });
        };
        configCtrl = createCrtl();
        configCtrl.$onInit();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    xdescribe('main()', function() {

        it("should delete name from user if that is Unknown", function() {
            const unknownUser = {
              name: 'Unknown'
            };

            expect(unknownUser.name).not.toBeUndefined();

            authService.getCurrentUser = function() {
                return new User(unknownUser);
            };

            // configCtrl = createCrtl();

            expect(configCtrl.newUser.name).toBeUndefined();
        });
    });

    describe('finish()', function(){

        it("Should show a message when the user is invalid", function(){
            spyOn(messageService, 'showToast');
            spyOn(configCtrl, '_saveImage').and.returnValue(Promise.resolve());
            spyOn(configCtrl.newUser, 'isValid').and.returnValue(false);
            configCtrl._saveUser().should.be.resolved;
            expect(messageService.showToast).toHaveBeenCalledWith("Campos obrigatórios não preenchidos corretamente.");
        });

        xit('Should change informations of user from system', function(done) {
            spyOn(state, 'go');
            spyOn(userService, 'save').and.callThrough();

            spyOn(authService, 'save');


            expect(configCtrl.newUser.name).toEqual(user.name);
            expect(configCtrl.newUser.email).toEqual(user.email);
            expect(configCtrl.newUser.cpf).toEqual(user.cpf);

            httpBackend.expect('PATCH', '/api/user').respond(newUser);

            const promise = configCtrl.finish();

            promise.should.be.fulfilled.then(function() {
                expect(state.go).toHaveBeenCalledWith(states.HOME);
                expect(userService.save).toHaveBeenCalled();
                expect(authService.save).toHaveBeenCalled();
            }).should.notify(done);

            httpBackend.flush();
            scope.$apply();
        });
    });

    describe('addImage()', function() {

        it('Should set a new image to the user', function() {
            const imageInput = createImage(100);
            const imageOutput = createImage(800);
            spyOn(imageService, 'compress').and.returnValue(deferred.promise);
            spyOn(imageService, 'readFile');
            deferred.resolve(imageOutput);
            configCtrl.addImage(imageInput);
            scope.$apply();
            expect(imageService.compress).toHaveBeenCalledWith(imageInput, 800);
            expect(configCtrl.photo_user).toBe(imageOutput);
            expect(imageService.readFile).toHaveBeenCalled();
            expect(configCtrl.file).toBe(null);
        });
    });

    describe('cropImage()', function() {
        beforeEach(function() {
            const image = createImage(100);
            spyOn(cropImageService, 'crop').and.callFake(fakeCallback("Image"));
            spyOn(imageService, 'compress').and.callFake(fakeCallback(image));
            spyOn(imageService, 'readFile').and.callFake(function() {
                configCtrl.newUser.photo_url = "Base64 data of photo";
            });
        });

        it('should crop image in config user', function() {
            spyOn(configCtrl, 'addImage');
            const image = createImage(100);
            configCtrl.cropImage(image);
            expect(cropImageService.crop).toHaveBeenCalled();
            expect(configCtrl.addImage).toHaveBeenCalled();
        });
    });

    xdescribe('removeInstitution()', function() {

        let promise;

        beforeEach(function() {
            spyOn(configCtrl.newUser, 'isAdmin');

            spyOn(mdDialog, 'show').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });

            spyOn(userService, 'deleteInstitution').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });

            spyOn(authService, 'logout').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });

            spyOn(authService, 'save').and.callThrough();
            promise = configCtrl.removeInstitution('$event', institution);
        });

        it('Should call user.isAdmin()', function(done) {
            promise.then(function() {
                expect(configCtrl.newUser.isAdmin).toHaveBeenCalled();
                done();
            });
        });

        it('Should call mdDialog.show()', function(done) {
            promise.then(function() {
                expect(mdDialog.show).toHaveBeenCalled();
                done();
            });
        });

        it('Should call userService.deleteInstitution()', function(done) {
            promise.then(function() {
                expect(userService.deleteInstitution).toHaveBeenCalledWith(institution.key);
                done();
            });
        });

        it('Should call authService.logout()', function(done) {
            promise.then(function() {
                expect(authService.logout).toHaveBeenCalled();
                done();
            });
        });

        it('Should call authService.save()', function(done) {
            user.institutions.push(other_institution);
            promise = configCtrl.removeInstitution('$event', institution);

            promise.then(function() {
                expect(user.institutions).toEqual([other_institution]);
                expect(authService.save).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('deleteAccount()', function() {

        let promise;

        beforeEach(function() {
            spyOn(mdDialog, 'show').and.callFake(fakeCallback());
            spyOn(userService, 'deleteAccount').and.callFake(fakeCallback());
            spyOn(authService, 'logout').and.callFake(fakeCallback());
            promise = configCtrl.deleteAccount();
        });

        it('Should call mdDialog.show()', function(done) {
            promise.then(function() {
                expect(mdDialog.show).toHaveBeenCalled();
                done();
            });
        });

        it('Should call userService.deleteAccount()', function(done) {
            promise.then(function() {
                expect(userService.deleteAccount).toHaveBeenCalled();
                done();
            });
        });

        it('Should call authService.logout()', function(done) {
            promise.then(function() {
                expect(authService.logout).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('editProfile', function() {
        it('should call mdDialog.show', function() {
            spyOn(mdDialog, 'show');
            configCtrl.editProfile(institution, '$event');
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));