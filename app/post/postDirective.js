   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService, $mdToast, $rootScope, ImageService) {
        var postCtrl = this;

        postCtrl.post = {};

        postCtrl.addImage = function(image) {
            var jpgType = "image/jpeg";
            var pngType = "image/png";
            var maximumSize = 5242880; // 5Mb in bytes
            var newSize = 1024;

            if (image !== null && (image.type === jpgType || image.type === pngType) && image.size <= maximumSize) {
                ImageService.compress(image, newSize).then(function success(data) {
                    postCtrl.photo_post = data;
                    ImageService.readFile(data, setImage);
                    postCtrl.file = null;
                });
            } else {
                showToast("Imagem deve ser jpg ou png e menor que 5 Mb");
            }
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                postCtrl.post.photo_url = image.src;
            });
        }

        postCtrl.isPostValid = function isPostValid() {
            if (postCtrl.user) {
                var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                return post.isValid();
            } else {
                return false;
            }
        };

        postCtrl.createPost = function createPost() {
            if (postCtrl.photo_post) {
                ImageService.saveImage(postCtrl.photo_post).then(function success(data) {
                    postCtrl.post.photo_url = data.url;
                    postCtrl.post.uploaded_images = [data.url];
                    savePost();
                    postCtrl.post.photo_url = null;
                });
            } else {
                savePost();
            }
        };

        function savePost() {
            var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            if (post.isValid()) {
                PostService.createPost(post).then(function success(response) {
                    postCtrl.clearPost();
                    showToast('Postado com sucesso!');
                    $mdDialog.hide();
                    $rootScope.$broadcast("reloadPosts", response.data);
                }, function error(response) {
                    $mdDialog.hide();
                    showToast(response.data.msg);
                });
            } else {
                showToast('Post inválido!');
            }
        }

        postCtrl.cancelDialog = function() {
            $mdDialog.hide();
        };

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
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

    app.directive("createPost", function() {
        return {
            restrict: 'E',
            templateUrl: "post/new_post.html",
            controllerAs: "postCtrl",
            controller: "PostController",
            scope: {
                user: '=',
                isDialog: '='
            },
            bindToController: true
        };
    });
})();