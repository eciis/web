"use strict";

(describe('Test UploadImageController', function() {

    var createCtrl, uploadImageCtrl, scope, firebaseStorage;
    var user = {
        name: 'Luiz',
        photo_url: null,
        uploaded_images: []
    };

    var firebaseConfig = {
        apiKey: "AIzaSyCrrVy8FgG_jV-1h0EM4jpKbF3Vk5EjwCc",   // Your Firebase API key
        authDomain: "eciis-splab.firebaseapp.com",           // Your Firebase Auth domain ("*.firebaseapp.com")
        databaseURL: "https://eciis-splab.firebaseio.com",   // Your Firebase Database URL ("https://*.firebaseio.com")
        storageBucket: "eciis-splab.appspot.com"             // Your Cloud Storage for Firebase bucket ("*.appspot.com")
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

    beforeEach(inject(function($controller, $rootScope, $firebaseStorage, ImageService) {
        scope = $rootScope.$new();
        firebaseStorage = $firebaseStorage;
        createCtrl = function() {
            return $controller('UploadImageController',
            {
                scope: scope,
                imageService: ImageService
            });
        };
        firebase.initializeApp(firebaseConfig);
        uploadImageCtrl = createCtrl();
    }));

    describe('UploadImageController functions', function() {

        it('Test upload', function() {
            var storageRef = firebase.storage().ref("image/" + "teste");
            var teste = firebaseStorage(storageRef);

            spyOn(teste, '$put').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            var image = createImage(100);
            console.log(teste);
            uploadImageCtrl.upload(image, user);
            expect(teste.$put).toHaveBeenCalled();
            console.log(image.size);
        });
    });
}));