"use strict";

(function() {
    var app = angular.module('app');

    app.service("CompressService", function CompressService() {
        var service = this;

        service.compress = function comprimeImagem(file, callback) {
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

        function createImage(result) {
            var source_img_obj = new Image();
            source_img_obj.onload = function() {
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

                callback(compressedFile);
            };
            source_img_obj.src = result.target.result;
        }

            var fr = new FileReader();
            fr.onload = createImage;
            fr.readAsDataURL(file);
        };
    });
})();