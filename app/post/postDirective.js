   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService,
            $mdToast, $rootScope, ImageService, MessageService, $q, $scope, $state, PdfService) {
        var postCtrl = this;

        postCtrl.post = {};
        postCtrl.loading = false;
        postCtrl.deletePreviousImage = false;
        postCtrl.user = AuthService.getCurrentUser();
        postCtrl.photoUrl = "";
        postCtrl.pdfFiles = [];
        var pdfUrlFiles = null;

        postCtrl.addImage = function(image) {
            var newSize = 1024;

            ImageService.compress(image, newSize).then(function success(data) {
                postCtrl.photoBase64Data = data;
                ImageService.readFile(data, setImage);
                postCtrl.deletePreviousImage = true;
                postCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        postCtrl.addPdf = function addPdf(files) {
            postCtrl.pdfFiles = postCtrl.pdfFiles.concat(files);

        };

        postCtrl.createEditedPost = function createEditedPost(post) {
            postCtrl.photoUrl = post.photo_url;
            postCtrl.post = new Post(post, postCtrl.user.current_institution.key);
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                postCtrl.photoUrl = image.src;
            });
        }

        postCtrl.isPostValid = function isPostValid() {
            if (postCtrl.user) {
                var post;
                if(!postCtrl.isEditing) {
                    post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                } else {
                    post = postCtrl.post;
                }
                return post.isValid();
            } else {
                return false;
            }
        };

        postCtrl.save = function save(isEditing, originalPost, posts) {
            if(isEditing) {
                postCtrl.editPost(originalPost);
            } else {
                postCtrl.createPost(posts);
            }
        };

        postCtrl.createPost = function createPost(posts) {
            saveCreatedPost(posts);
        };

        function saveImage() {
            var deferred = $q.defer();
            if (postCtrl.photoBase64Data) {
                postCtrl.loading = true;
                ImageService.saveImage(postCtrl.photoBase64Data).then(function success(data) {
                    postCtrl.loading = false;
                    postCtrl.post.photo_url = data.url;
                    postCtrl.post.uploaded_images = [data.url];
                    deferred.resolve();
                }, function error() {
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function savePdf() {
            var deferred = $q.defer();
            if(postCtrl.pdfFiles.length > 0) {
                PdfService.save(postCtrl.pdfFiles[0], pdfUrlFiles).then(
                    function success(data) {
                        postCtrl.post.pdf_files = [].concat(data.url);
                        pdfUrlFiles = data.url;
                        deferred.resolve();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function saveFiles() {
            var deferred = $q.defer();
            if(postCtrl.files) {
                PdfService.save(postCtrl.file).then(
                    function success(data) {
                        postCtrl.post.pdfFiles = data.url;
                        deferred.resolve();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        postCtrl.editPost = function editPost(originalPost) {
            deleteImage(postCtrl.post).then(function success() {
                if (postCtrl.photoBase64Data) {
                    savePostWithImage(originalPost);
                } else {
                    saveEditedPost(originalPost);
                }
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        function deleteImage() {
            var deferred = $q.defer();

            if(postCtrl.post.photo_url && postCtrl.deletePreviousImage) {
                ImageService.deleteImage(postCtrl.post.photo_url).then(function success() {
                        postCtrl.post.photo_url = "";
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

        function saveCreatedPost(posts) {
            var savePromises = [savePdf(), saveImage()];
            $q.all(savePromises).then(function success() {
                var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                if (post.isValid()) {
                    PostService.createPost(post).then(function success(response) {
                        postCtrl.clearPost();
                        posts.push(new Post(response.data));
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
            });
            postCtrl.post.photo_url = null;
            postCtrl.post.pdf_files = [];

        }

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
            postCtrl.pdfFiles = [];
        };

        function saveEditedPost(originalPost) {
            var post = new Post(originalPost, postCtrl.user.current_institution.key);
            if (postCtrl.post.isValid()) {
                PostService.save(post, postCtrl.post).then(function success() {
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
                postCtrl.post.photo_url = data.url;
                postCtrl.post.uploaded_images.push(data.url);
                saveEditedPost(post);
            });
        }

        postCtrl.cancelDialog = function() {
            postCtrl.post = {};
            $mdDialog.hide();
        };

        postCtrl.showButton = function() {
            return postCtrl.post.title && !postCtrl.loading;
        };

        postCtrl.showImage = function() {
            var isImageEmpty = postCtrl.photoUrl === "";
            var isImageNull = postCtrl.photoUrl === null;
            var hasTitle = postCtrl.post.title;
            return !isImageEmpty && !isImageNull && hasTitle;
        };

        postCtrl.showFiles = function() {
            var noFiles = postCtrl.pdfFiles.length > 0;
            return noFiles;
        };

        postCtrl.hideFile = function(index) {
            postCtrl.pdfFiles.splice(index, 1);
        };

        (function main() {
            if($scope.isEditing) {
                postCtrl.createEditedPost($scope.originalPost);
            }
        })();

        postCtrl.hideImage = function() {
           postCtrl.photoUrl = "";
           postCtrl.photoBase64Data = null;
           postCtrl.deletePreviousImage = true;
        };
    });


    app.directive("savePost", function() {
        return {
            restrict: 'E',
            templateUrl: "post/save_post.html",
            controllerAs: "postCtrl",
            controller: "PostController",
            scope: {
                isDialog: '=',
                posts: '=',
                originalPost: '=',
                isEditing: '='
            }
        };
    });
})();