"use strict";
(function() {
var app = angular.module('app');

    app.controller('UpladImageController', ['Upload', function (Upload) {
        var vm = this;

        // upload on file select or drop
        vm.upload = function (file, model) {
            console.log(file);
            Upload.upload({
                url: '/api/images',
                data: {image: file}
            }).then(function (resp) {
                model.photo_url = resp.data.file_url;
                delete vm.file;
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            });
        };
    }]);

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