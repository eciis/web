'use strict';

(describe('Test ConfigProfileController', function() {
    var configCtrl, httpBackend, deffered, scope, userService, createCrtl, state, mdToast, authService, imageService;
    var splab = {
        name: 'SPLAB',
        key: '987654321'
    };

    var user = {
        name: 'Maiana',
        cpf: '121.445.044-07',
        email: 'maiana.brito@ccc.ufcg.edu.br',
        institutions: [splab],
        uploaded_images: []
    };

    var newUser = {
        name: 'Maiana Brito',
        cpf: '121.115.044-07',
        email: 'maiana.brito@ccc.ufcg.edu.br',
        institutions: [splab],
    };

    function base64toBlob(base64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength =  byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);

            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    function createImage(size) {
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var context = canvas.getContext("2d");
        var imageData = context.createImageData(size, size);

        for (var i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = 255;
            imageData.data[i+1] = 100;
            imageData.data[i+2] = 0;
            imageData.data[i+3] = 255;
        }

        context.putImageData(imageData, 0, 0);
        imageData = canvas.toDataURL("image/jpeg", 1);

        var image = new File([base64toBlob(imageData.split(',')[1]),
            'image/jpeg'],
            'imageTest',
            {type: 'image/jpeg'});

        return image;
    }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, $mdToast, UserService, AuthService, ImageService) {
        httpBackend = $httpBackend;
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        scope = $rootScope.$new();
        state = $state;
        imageService = ImageService;
        mdToast = $mdToast;
        deffered = $q.defer();
        userService = UserService;

        authService = AuthService;

        authService.getCurrentUser = function() {
            return new User(user);
        };

        createCrtl = function() {
            return $controller('ConfigProfileController', {
                    scope: scope,
                    authService: authService,
                    userService: userService,
                    imageService: imageService
                });
        };
        configCtrl = createCrtl();
        httpBackend.flush();
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
                name: 'Maiana Brito',
                cpf: '',
                email: 'maiana.brito@ccc.ufcg.edu.br',
                institutions: [splab]
            };

            configCtrl.newUser = new User(userInvalid);
            expect(configCtrl.newUser.isValid()).toEqual(false);

            configCtrl.finish().should.be.rejected;
            expect(mdToast.show).toHaveBeenCalled();
        });

        it('Should change informations of user from system', function(done) {
            spyOn(state, 'go');
            spyOn(userService, 'save').and.callThrough();

            spyOn(authService, 'reload').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(newUser);
                    }
                };
            });


            expect(configCtrl.newUser.name).toEqual(user.name);
            expect(configCtrl.newUser.email).toEqual(user.email);
            expect(configCtrl.newUser.cpf).toEqual(user.cpf);

            httpBackend.expect('PATCH', '/api/user').respond(newUser);

            var promise = configCtrl.finish();

            promise.should.be.fulfilled.then(function() {
                expect(state.go).toHaveBeenCalledWith('app.home');
                expect(userService.save).toHaveBeenCalled();
                expect(authService.reload).toHaveBeenCalled();
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

        it('Add new image in post', function() {
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
}));