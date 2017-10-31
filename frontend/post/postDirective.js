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
        postCtrl.deletedFiles = [];
        postCtrl.addVideo = false;
        postCtrl.videoRegex = '(?:http(s)?:\/\/)?(www\.)?youtube\.com\/watch\\?v=.+';

        var observer;

        postCtrl.hasMedia = function hasMedia() {
            return postCtrl.photoBase64Data || postCtrl.pdfFiles.length > 0 || postCtrl.addVideo;
        };

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
            postCtrl.pdfFiles = files;
        };

        postCtrl.createEditedPost = function createEditedPost(post) {
            postCtrl.photoUrl = post.photo_url;
            postCtrl.pdfFiles = post.pdf_files.slice();
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

        function savePdf(pdfFile) {
            var deferred = $q.defer();
            if(pdfFile) {
                PdfService.save(pdfFile).then(
                    function success(data) {
                        if(postCtrl.post.pdf_files) {
                            var pdf = {
                                name: pdfFile.name,
                                url: data.url
                            };
                            postCtrl.post.pdf_files = postCtrl.post.pdf_files.concat(pdf);
                        }
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
            postCtrl.post.pdf_files = _.intersectionWith(postCtrl.pdfFiles, postCtrl.post.pdf_files, _.isEqual);
            var files = _.filter(postCtrl.pdfFiles, {'type': 'application/pdf'});
            if(postCtrl.pdfFiles.length > 0) {
                postCtrl.loading = true;
                var promises = _.map(files, savePdf);
                $q.all(promises).then(function success() {
                    postCtrl.loading = false;
                    deferred.resolve();
                }, function error() {
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function deletePdf(pdf) {
            var deferred = $q.defer();
            if(pdf) {
                PdfService.deleteFile(pdf.url).then(function success() {
                    deferred.resolve();
                }, function error() {
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        function deleteFiles() {
            var deferred = $q.defer();
            if (postCtrl.deletedFiles.length > 0) {
                var promises = _.map(postCtrl.deletedFiles, deletePdf);
                    $q.all(promises).then(function success() {
                        deferred.resolve();
                    }, function error() {
                        deferred.reject();
                    });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        }

        postCtrl.editPost = function editPost(originalPost) {
            deleteImage(postCtrl.post).then(function success() {
                saveEditedPost(originalPost);
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

        postCtrl.createPost = function createPost(posts) {
            var savePromises = [saveFiles(), saveImage()];
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
        };

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
            postCtrl.pdfFiles = [];
            postCtrl.hideImage();
        };

        postCtrl.showVideo = function showVideo() {
            return postCtrl.post.title && postCtrl.post.video_url;
        };

        postCtrl.showVideoUrlField = function showVideoUrlField() {
            var showField = postCtrl.post.title && (postCtrl.addVideo || postCtrl.post.video_url);
            return showField;
        };

        postCtrl.setAddVideo = function setAddVideo() {
            if(postCtrl.post.video_url || postCtrl.addVideo) {
                postCtrl.addVideo = false;
                postCtrl.post.video_url = "";
            } else {
                postCtrl.addVideo = true;
            }
        };

        function saveEditedPost(originalPost) {
            var savePromises = [saveFiles(), saveImage()];
            $q.all(savePromises).then(function success() {
                var post = new Post(originalPost, postCtrl.user.current_institution.key);
                if (post.isValid()) {
                    var patch = generatePatch(post, postCtrl.post);
                    PostService.save(postCtrl.post.key, patch).then(function success() {
                        deleteFiles().then(function success() {
                            postCtrl.deletedFiles = [];
                            MessageService.showToast('Publicação editada com sucesso!');
                            $mdDialog.hide(postCtrl.post);
                        }, function error(response) {
                            $mdDialog.cancel();
                            MessageService.showToast(response.data.msg);
                        });
                    });
                } else {
                    MessageService.showToast('Edição inválida!');
                }
            });
        }

        function generatePatch(post, newPost) {
            post = JSON.parse(angular.toJson(post));
            newPost = JSON.parse(angular.toJson(newPost));
            return jsonpatch.compare(post, newPost);
        }

        postCtrl.cancelDialog = function() {
            postCtrl.clearPost();
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
            var hasFiles = postCtrl.pdfFiles.length > 0;
            return hasFiles;
        };

        postCtrl.hideFile = function(index) {
            if (_.includes(postCtrl.post.pdf_files, postCtrl.pdfFiles[index])) {
                postCtrl.deletedFiles.push(postCtrl.pdfFiles[index]);
            }
            postCtrl.pdfFiles.splice(index, 1);
        };

        postCtrl.hideImage = function() {
           postCtrl.photoUrl = "";
           postCtrl.photoBase64Data = null;
           postCtrl.deletePreviousImage = true;
        };

        postCtrl.getInstPhotoUrl = function getInstPhotoUrl() {
            var photoUrl = postCtrl.user.current_institution.photo_url;
            if($scope.isEditing) {
                photoUrl = postCtrl.post.institution_image;
            }
            return photoUrl;
        };

        postCtrl.getInstName = function getInstName() {            
            var instName = postCtrl.user.current_institution.name;
            if($scope.isEditing) {
                instName = postCtrl.post.institution_name;
            }
            return instName;
        };

        (function main() {
            if($scope.isEditing) {
                postCtrl.createEditedPost($scope.originalPost);
                observer = jsonpatch.observe(postCtrl.post);
            }
        })();
    });

    app.directive("savePost", function() {
        return {
            restrict: 'E',
            templateUrl: "app/post/save_post.html",
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