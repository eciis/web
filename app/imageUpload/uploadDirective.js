"use strict";

(function() {
    var app = angular.module('app');

    app.controller('UpladImageController', function (Upload, $mdToast) {
        var uploadImgCtrl = this;
        var URL_UPLOAD_IMAGE = '/api/images';

        // upload on file select or drop
        uploadImgCtrl.upload = function (file, model) {
            var jpgType = "image/jpeg";
            var pngType = "image/png";
            var maximumSize = 5242880; // 5Mb in bytes

            if ((file.type === jpgType || file.type === pngType) && file.size <= maximumSize) {
                Upload.upload({
                    url: URL_UPLOAD_IMAGE,
                    data: {image: file}
                }).then(function (response) {
                    model.photo_url = response.data.file_url;
                    uploadImgCtrl.file = null;
                }, function (response) {
                    showToast("Problemas encontrados ao fazer upload da imagem" + response.config.data.image.name);
                });
            } else {
                showToast("Image deve ser do tipo png ou jpeg e deve ter tamanho menor ou igual a 5 mega bytes");
            }
        };

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
            controller: "UpladImageController",
            transclude: true,
            scope: {
                model: '='
            }
        };
    });
})();