"use strict";

(function() {
    var app = angular.module('app');

    app.service("ImageService", function CompressService( $q, $firebaseStorage) {
        var service = this;
        var folderImages = 'images/';

        service.compress = function compress(file, callback) {
            var fileReader = new FileReader();

            fileReader.onload = function createImage(result) {
                var source_img_obj = new Image();
                source_img_obj.onload = function() {
                    var compressedFile = compressImage(source_img_obj, file);
                    callback(compressedFile);
                };
                source_img_obj.src = result.target.result;
            };

            fileReader.readAsDataURL(file);
        };

        service.saveImage = function(file) {
            var INDEX_FILENAME = 0;
            var INDEX_TYPE_FILE = 1;
            var fileProperties = file.name.split(".");
            var filename = fileProperties[INDEX_FILENAME]  + "-" + (new Date()).getTime();
            var image = firebase.storage().ref(folderImages + filename);
            var deferred = $q.defer();

            var metadata = {
                contentType: 'image/' + fileProperties[INDEX_TYPE_FILE]
            };

            var promise = $firebaseStorage(image).$put(file, metadata);

            promise.$complete(function(snapshot) {
                var data = {
                    url: snapshot.downloadURL
                };
                deferred.resolve(data);
            });

            promise.$error(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
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

        function compressImage(source_img_obj, file) {
            var height = source_img_obj.height;
            var width = source_img_obj.width;
            var fileProperties = file.name.split(".");
            var INDEX_TYPE_IMAGE = 1;
            var TYPE_IMAGE = 'image/' + fileProperties[INDEX_TYPE_IMAGE];
            var DIMENSION_IMAGE = "2d";
            var sizeNewImage = 800;
            var positionImage = 0;
            var qualityImage = 0.7;

            var cvs = document.createElement('canvas');
            cvs.width = sizeNewImage;
            cvs.height = sizeNewImage * (height / width);
            cvs.getContext(DIMENSION_IMAGE).drawImage(
                source_img_obj,
                positionImage,
                positionImage,
                cvs.width,
                cvs.height);
            var newImageData = cvs.toDataURL(TYPE_IMAGE, qualityImage);
            var compressedFile = new File([base64toBlob(
                newImageData.split(',')[1],
                TYPE_IMAGE)],
                file.name, {type: TYPE_IMAGE});

            return compressedFile;
        }
    });
})();