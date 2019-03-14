"use strict";

(function() {
    var app = angular.module("app");

    app.controller('CropImageController', function CropImageController(image_file, $rootScope,
        $mdDialog, ImageService, MessageService, areaType) {
        var cropImgCtrl = this;

        cropImgCtrl.image = '';
        cropImgCtrl.croppedImage = '';
        cropImgCtrl.areaType = areaType;

        function readImage(image_file) {
            ImageService.readFile(image_file, function (image) {
                readProperties(image_file, image);
                $rootScope.$apply(function() {
                    cropImgCtrl.image = image.src;
                });
            });
        }

        function readProperties(image_file, image) {
            var MAX_SIZE = 1024;
            cropImgCtrl.resultImgFormat = image_file.type;

            if(image.width > MAX_SIZE) {
                cropImgCtrl.resultImgSize = MAX_SIZE;
            } else {
                cropImgCtrl.resultImgSize = image.width;
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

        (function main() {
            if(ImageService.isValidImage(image_file)) {
                readImage(image_file);
            } else {
                MessageService.showErrorToast("Imagem deve ser jpg ou png e menor que 5 Mb");
                cropImgCtrl.cancelCrop();
            }
        })();
    });
})();