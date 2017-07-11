"use strict";

(function() {
    var app = angular.module('app');

    app.controller('UploadImageController', function (ImageService, $mdToast) {
        var uploadImgCtrl = this;
        uploadImgCtrl.model = {};

        // upload on file select or drop
        uploadImgCtrl.upload = function (file, model) {
            var jpgType = "image/jpeg";
            var pngType = "image/png";
            var maximumSize = 5242880; // 5Mb in bytes

            if ((file.type === jpgType || file.type === pngType) && file.size <= maximumSize) {
                uploadImgCtrl.model = model;
                ImageService.compress(file, saveImage);
            } else {
                showToast("Imagem deve ser jpg ou png e menor que 5 Mb");
            }
        };

        function saveImage(file) {
            ImageService.saveImage(file).then(function success(response) {
                uploadImgCtrl.model.photo_url = response.url;
                uploadImgCtrl.model.uploaded_images.push(response.url);
                uploadImgCtrl.file = null;
            }, function error(response) {
                showToast("Problemas encontrados ao fazer upload da imagem " + response.data);
            });
        }

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }
    });

    app.directive("uploadImage", function() {
        return {
            restrict: 'E',
            templateUrl: "imageUpload/upload_image.html",
            controllerAs: "upImageCtrl",
            controller: "UploadImageController",
            transclude: true,
            scope: {
                model: '='
            }
        };
    });
})();