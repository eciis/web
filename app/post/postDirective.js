   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService, $mdToast, $rootScope, ImageService, MessageService, $q) {
        var postCtrl = this;

        postCtrl.post = {};
        postCtrl.loading = false;
        postCtrl.deletePreviousImage = false;
        postCtrl.user = AuthService.getCurrentUser();
        postCtrl.photoUrl = "";

        postCtrl.addImage = function(image) {
            var newSize = 1024;

            ImageService.compress(image, newSize).then(function success(data) {
                postCtrl.photo_post = data;
                ImageService.readFile(data, setImage);
                postCtrl.deletePreviousImage = true;
                postCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        postCtrl.hideImageEdit = function() {
            postCtrl.photoUrl = "";
            postCtrl.photoBase64Data = null;
            postCtrl.deletePreviousImage = true;
        };

        postCtrl.createEditedPost = function createEditedPost() {
            /*postCtrl.newPost = new Post(post, postCtrl.user.current_institution.key);*/
        };
        //Perguntar pra luiz.
        function setImage(image) {
            $rootScope.$apply(function() {
                postCtrl.post.photo_url = image.src;
            });
        }

        function setImageEdit(image) {
            $rootScope.$apply(function() {
                postCtrl.photoUrl = image.src;
            });
        }

        postCtrl.isEditingPost = function isEditingPost(boolean, post) {
            console.log(post);
            if(boolean) {
                postCtrl.photoUrl = post.photo_url;
                postCtrl.createEditedPost(post);
            }
            return boolean;
        };

        postCtrl.isPostValid = function isPostValid() {
            if (postCtrl.user) {
                var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                return post.isValid();
            } else {
                return false;
            }
        };

        postCtrl.isEditedPostValid = function isEditedPostValid() {
            if (postCtrl.user) {
                return postCtrl.newPost.isValid();
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

        postCtrl.editPost = function editPost(post) {
            deleteImage(post).then(function success() {
                if (postCtrl.photoBase64Data) {
                    savePostWithImage(post);
                } else {
                    savePost(post);
                }
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        function deleteImage(post) {
            var deferred = $q.defer();

            if(post.photo_url && postCtrl.deletePreviousImage) {
                ImageService.deleteImage(post.photo_url).then(function success() {
                        post.photo_url = "";
                        deferred.resolve();
                    }, function error(error) {
                        deferred.reject(error);
                    }
                );
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }

        function savePost() {
            var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            if (post.isValid()) {
                PostService.createPost(post).then(function success(response) {
                    postCtrl.clearPost();
                    postCtrl.posts.push(new Post(response.data));
                    MessageService.showToast('Postado com sucesso!');
                    $mdDialog.hide();
                }, function error(response) {
                    $mdDialog.hide();
                    MessageService.showToast(response.data.msg);
                });
            } else {
                MessageService.showToast('Post inválido!');
            }
        }

        function saveEditedPost(post) {
            if (postCtrl.newPost.isValid()) {
                PostService.save(post, postCtrl.newPost).then(function success() {
                    MessageService.showToast('Publicação editada com sucesso!');
                    $mdDialog.hide(postCtrl.post);
                }, function error(response) {
                    $mdDialog.cancel();
                    MessageService.showToast(response.data.msg);
                });
            } else {
                MessageService.showToast('Edição inválida!');
            }
        }

        function savePostWithImage(post) {
            postCtrl.loading = true;
            ImageService.saveImage(postCtrl.photoBase64Data).then(function success(data) {
                postCtrl.loading = false;
                post.photo_url = data.url;
                post.uploaded_images.push(data.url);
                saveEditedPost(post);
            });
        }

        postCtrl.showMessage = function showMessage(isEditing) {
            var firstCondition = postCtrl.post.title && !isEditing;
            var secondCondition = postCtrl.newPost.title && isEditing;
            return firstCondition || secondCondition;
        };

        postCtrl.cancelDialog = function() {
            $mdDialog.hide();
        };

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
        };

        postCtrl.showButton = function() {
            return postCtrl.post.title && !postCtrl.loading;
        };
        //showButton
        postCtrl.teste = function(post) {
            return post.title && !postCtrl.loading;
        };

        postCtrl.showImage = function() {
            return postCtrl.post.photo_url;
        };

        postCtrl.showImageEdit = function() {
            var imageEmpty = postCtrl.photoUrl === "";
            var imageNull = postCtrl.photoUrl === null;
            return !imageEmpty && !imageNull;
        };

        (function main() {
          /* postCtrl.photoUrl = postCtrl.post.photo_url;
            postCtrl.createEditedPost();*/
        })();

        postCtrl.hideImage = function() {
            postCtrl.post.photo_url = "";
            postCtrl.photo_post = null;
            postCtrl.deletePreviousImage = true;
        };
    });



    app.directive("createPost", function() {
        return {
            restrict: 'E',
            templateUrl: "post/new_post.html",
            controllerAs: "postCtrl",
            controller: "PostController",
            scope: {
                isDialog: '=',
                posts: '=',
                originalPost: '=',
                isEditing: '='
            },
            bindToController: true
        };
    });
})();