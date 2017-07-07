"use strict";

(function() {
    var app = angular.module('app');

    app.controller('UpladImageController', function (CompressService, CRUDService, $mdToast) {
        var uploadImgCtrl = this;
        var URL_UPLOAD_IMAGE = '/api/images';
        uploadImgCtrl.model = {};

        // upload on file select or drop
        uploadImgCtrl.upload = function (file, model) {
            uploadImgCtrl.model = model;
            CompressService.compress(file, saveImage);
            //var jpgType = "image/jpeg";
            //var pngType = "image/png";
            //var maximumSize = 5242880; // 5Mb in bytes

            //if ((file.type === jpgType || file.type === pngType) && file.size <= maximumSize) {
                //Upload.upload({
                    //url: URL_UPLOAD_IMAGE,
                    //data: {image: file}
                //}).then(function (response) {
                    //model.photo_url = response.data.file_url;
                    //uploadImgCtrl.file = null;
                //}, function (response) {
                    //showToast("Problemas encontrados ao fazer upload da imagem" + response.config.data.image.name);
                //});
            //} else {
                //showToast("Imagem deve ser jpg ou png e menor que 5 Mb");
            //}
        };

        function saveImage(file) {
            CRUDService.saveImage(file).then(function success(response) {
                console.log(response);
                uploadImgCtrl.model.photo_url = response.url;
                uploadImgCtrl.file = null;
            }, function error(response) {
                showToast("Problemas encontrados ao fazer upload da imagem" + response.config.data.image.name);
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
            controller: "UpladImageController",
            transclude: true,
            scope: {
                model: '='
            }
        };
    });
})();