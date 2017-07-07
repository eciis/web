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
                var bytesLength = byteCharacters.length;
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

                var cvs = document.createElement('canvas');
                cvs.width = 800;
                cvs.height = 800 * (height / width);
                var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0, cvs.width, cvs.height);
                var newImageData = cvs.toDataURL('image/jpeg', 70/100);
                var compressedFile = new File([base64toBlob(newImageData.split(',')[1], 'image/jpeg')], file.name, {type: 'image/jpeg'});

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