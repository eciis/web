'use strict';

(describe('Test ConfigProfileController', function() {
    var configCtrl, httpBackend, deffered, scope, userService, createCrtl, state,
    mdToast, authService, imageService, mdDialog, cropImageService;

    var institution = {
        name: 'institution',
        key: '987654321'
    };

    var other_institution = {
        name: 'other_institution',
        key: '3279847298'
    };

    var user = {
        name: 'User',
        cpf: '121.445.044-07',
        email: 'teste@gmail.com',
        institutions: [institution],
        uploaded_images: [],
        institutions_admin: [],
        state: 'active'
    };

    var newUser = {
        name: 'newUser',
        cpf: '121.115.044-07',
        email: 'teste@gmail.com',
        institutions: [institution],
        institutions_admin: []
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state,
        $mdToast, $mdDialog, UserService, AuthService, ImageService, CropImageService) {

        httpBackend = $httpBackend;
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        scope = $rootScope.$new();
        state = $state;
        imageService = ImageService;
        mdToast = $mdToast;
        mdDialog = $mdDialog;
        deffered = $q.defer();
        userService = UserService;
        cropImageService = CropImageService;

        authService = AuthService;

        authService.login(user);

        createCrtl = function() {
            return $controller('ConfigProfileController', {
                    scope: scope,
                    authService: authService,
                    userService: userService,
                    imageService: imageService,
                    cropImageService : cropImageService
                });
        };
        configCtrl = createCrtl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('main()', function() {

        it("should delete name from user if that is Unknown", function() {
            var unknownUser = {
              name: 'Unknown'
            };

            expect(unknownUser.name).not.toBeUndefined();

            authService.getCurrentUser = function() {
                return new User(unknownUser);
            };

            configCtrl = createCrtl();

            expect(configCtrl.newUser.name).toBeUndefined();
        });
    });

    describe('finish()', function(){

        it("Should call mdToast.show", function(){
            spyOn(mdToast, 'show');

            var userInvalid = {
                name: 'Invalid User',
                cpf: '',
                email: 'invalidUser@gmail',
                institutions: [institution]
            };

            configCtrl.newUser = new User(userInvalid);
            expect(configCtrl.newUser.isValid()).toEqual(false);

            configCtrl.finish().should.be.rejected;
            expect(mdToast.show).toHaveBeenCalled();
        });

        it('Should change informations of user from system', function(done) {
            spyOn(state, 'go');
            spyOn(userService, 'save').and.callThrough();

            spyOn(authService, 'save');


            expect(configCtrl.newUser.name).toEqual(user.name);
            expect(configCtrl.newUser.email).toEqual(user.email);
            expect(configCtrl.newUser.cpf).toEqual(user.cpf);

            httpBackend.expect('PATCH', '/api/user').respond(newUser);

            var promise = configCtrl.finish();

            promise.should.be.fulfilled.then(function() {
                expect(state.go).toHaveBeenCalledWith('app.user.home');
                expect(userService.save).toHaveBeenCalled();
                expect(authService.save).toHaveBeenCalled();
            }).should.notify(done);

            httpBackend.flush();
            scope.$apply();
        });
    });

    describe('addImage()', function() {
        beforeEach(function() {
            var image = createImage(100);
            spyOn(imageService, 'compress').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(image);
                    }
                };
            });

            spyOn(imageService, 'readFile').and.callFake(function() {
                configCtrl.newUser.photo_url = "Base64 data of photo";
            });

            spyOn(imageService, 'saveImage').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback({
                            url : "imagens/test"
                        });
                    }
                };
            });
        });

        it('Should add new image in post', function() {
            spyOn(userService, 'save').and.callThrough();

            spyOn(authService, 'reload').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(newUser);
                    }
                };
            });

            httpBackend.expect('PATCH', '/api/user').respond(newUser);

            var image = createImage(100);
            configCtrl.addImage(image);
            configCtrl.finish();

            httpBackend.flush();
            scope.$apply();

            expect(imageService.compress).toHaveBeenCalled();
            expect(imageService.readFile).toHaveBeenCalled();
            expect(imageService.saveImage).toHaveBeenCalled();
        });
    });

    describe('cropImage()', function() {
        beforeEach(function() {
            var image = createImage(100);

            spyOn(cropImageService, 'crop').and.callFake(function() {
                return {
                    then : function(callback) {
                        return callback("Image");
                    }
                };
            });

            spyOn(imageService, 'compress').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(image);
                    }
                };
            });

            spyOn(imageService, 'readFile').and.callFake(function() {
                configCtrl.newUser.photo_url = "Base64 data of photo";
            });
        });

        it('should crop image in config user', function() {
            spyOn(configCtrl, 'addImage');
            var image = createImage(100);
            configCtrl.cropImage(image);
            expect(cropImageService.crop).toHaveBeenCalled();
            expect(configCtrl.addImage).toHaveBeenCalled();
        });
    });

    describe('removeInstitution()', function() {

        var promise;

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

        var promise;

        beforeEach(function() {
            spyOn(mdDialog, 'show').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });

            spyOn(userService, 'deleteAccount').and.callFake(function() {
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