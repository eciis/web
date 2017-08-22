"use strict";

(function() {
    var app = angular.module("app");

    app.controller('CropImageController', function CropImageController(image_file, $rootScope, $mdDialog, ImageService, MessageService) {
        var cropImgCtrl = this;

        cropImgCtrl.image = '';
        cropImgCtrl.croppedImage = '';

        function readImage(image_file) {
            readProperties(image_file);
            var reader = new FileReader();
            reader.onload = function (evt) {
                    $rootScope.$apply(function(){
                        cropImgCtrl.image=evt.target.result;
                    });
            };
            reader.readAsDataURL(image_file);
        }

        function readProperties(image_file) {
            var MAX_SIZE = 1024;
            cropImgCtrl.resultImgFormat = image_file.type;

            if(image_file.size > MAX_SIZE) {
                cropImgCtrl.resultImgSize = MAX_SIZE;
            } else {
                cropImgCtrl.resultImgSize = image_file.size;
            }
        }

        cropImgCtrl.confirmCrop = function confirmCrop() {
            var image = new Image();
            image.onload = function() {
                cropImage(image);
            };
            image.src = cropImgCtrl.croppedImage;
        };

        function cropImage(image) {
            var height = image.height;
            var width = image.width;
            var qualityImage = 1;

            image_file = ImageService.createImageFile(image, image_file, height, width, qualityImage);
            $mdDialog.hide(image_file);
        }

        cropImgCtrl.cancelCrop = function cancelCrop() {
            $mdDialog.cancel();
        };

        function main() {
            if(ImageService.isValidImage(image_file)) {
                readImage(image_file);
            } else {
                MessageService.showToast("Imagem deve ser jpg ou png e menor que 5 Mb");
                cropImgCtrl.cancelCrop();
            }
        }

        main();
    });
})();