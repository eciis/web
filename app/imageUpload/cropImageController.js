"use strict";

(function() {
    var app = angular.module("app");

    app.controller('CropImageController', function CropImageController(image_file, new_size,$rootScope, $mdDialog, ImageService) {
        var cropImgCtrl = this;

        cropImgCtrl.image = '';
        cropImgCtrl.croppedImage = '';

        function readImage(image_file) {
            readProperties(image_file);
            var reader = new FileReader();
            reader.onload = function (evt) {
                    $rootScope.$apply(function(){
                        cropImgCtrl.Image=evt.target.result;
                    });
            };
            reader.readAsDataURL(image_file);
        }

        function readProperties(image_file) {
            cropImgCtrl.resultImgSize = image_file.size;
            cropImgCtrl.resultImgFormat = image_file.type;
        }

        cropImgCtrl.confirmCrop = function confirmCrop() {
            $mdDialog.hide(cropImgCtrl.croppedImage);
        };

        cropImgCtrl.cancelCrop = function cancelCrop() {
            $mdDialog.cancel();
        }

        (function main() {
            readImage(image_file);
        })();
    });
})();