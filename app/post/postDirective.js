   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService, $mdToast, $rootScope, ImageService, MessageService, $state) {
        var postCtrl = this;

        postCtrl.post = {};
        postCtrl.loading = false;

        postCtrl.addImage = function(image) {
            var newSize = 1024;

            ImageService.compress(image, newSize).then(function success(data) {
                postCtrl.photo_post = data;
                ImageService.readFile(data, setImage);
                postCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
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
                postCtrl.loading = true;
                ImageService.saveImage(postCtrl.photo_post).then(function success(data) {
                    postCtrl.loading = false;
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
                    postCtrl.posts.push(new Post(response.data));
                    MessageService.showToast('Postado com sucesso!');
                    $mdDialog.hide();
                }, function error(response) {
                    AuthService.reload().then(function success() {
                        $mdDialog.hide();
                        MessageService.showToast(response.data.msg);
                        $state.go('app.home');
                    });
                });
            } else {
                MessageService.showToast('Post inválido!');
            }
        }

        postCtrl.cancelDialog = function() {
            $mdDialog.hide();
        };

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
        };

        postCtrl.showButton = function() {
            return postCtrl.post.title && !postCtrl.loading;
        };

        postCtrl.showImage = function() {
            return postCtrl.post.photo_url;
        };
    });

    app.directive("createPost", function() {
        return {
            restrict: 'E',
            templateUrl: "post/new_post.html",
            controllerAs: "postCtrl",
            controller: "PostController",
            scope: {
                user: '=',
                isDialog: '=',
                posts: '='
            },
            bindToController: true
        };
    });
})();