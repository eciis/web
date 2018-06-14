"use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService,
            $mdToast, $rootScope, ImageService, MessageService, $q, $scope, $state, PdfService, SubmitFormListenerService) {
        var postCtrl = this;

        postCtrl.post = {};
        postCtrl.typePost = 'Common';
        postCtrl.loading = false;
        postCtrl.loadingPost = false;
        postCtrl.deletePreviousImage = false;
        postCtrl.user = AuthService.getCurrentUser();
        postCtrl.photoUrl = "";
        postCtrl.pdfFiles = [];
        postCtrl.deletedFiles = [];
        postCtrl.hasVideo = false;
        postCtrl.videoRegex = '(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+';
        postCtrl.options = [];
        var option_empty = {'text': '',
                            'number_votes': 0,
                            'voters': []
                            };
        var timelineContent = document.getElementById('content');
        var MAXIMUM_PDF_SIZE = 5242880; // 5Mb in bytes

        postCtrl.hasMedia = function hasMedia() {
            return postCtrl.photoBase64Data || postCtrl.pdfFiles.length > 0 || postCtrl.hasVideo || postCtrl.photoUrl;
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

        postCtrl.setTypeOfPost = function() {
            postCtrl.typePost === "Common" ? postCtrl.choiceSurvey() : postCtrl.choiceCommon();
        };

        postCtrl.choiceCommon = function() {
            if(postCtrl.typePost === "Survey") {
                postCtrl.typePost = "Common";
                postCtrl.clearPost();
            }
        };

        postCtrl.choiceSurvey = function() {
            if(postCtrl.typePost === "Common"){
                postCtrl.typePost = "Survey";
                postCtrl.clearPost();
                postCtrl.options.push(angular.copy(option_empty));
                postCtrl.options.push(angular.copy(option_empty));
            }
        };

        postCtrl.addPdf = function addPdf(files) {
            if(files[0].size > MAXIMUM_PDF_SIZE) {
                MessageService.showToast('O arquivo deve ser um pdf menor que 5 Mb');
            } else {
                postCtrl.pdfFiles = files;
            }      
        };

        postCtrl.createEditedPost = function createEditedPost(post) {
            postCtrl.photoUrl = post.photo_url;
            postCtrl.pdfFiles = post.pdf_files.slice();
            postCtrl.hasVideo = post.video_url ? true : false;
            postCtrl.post = new Post(post, postCtrl.user.current_institution.key);
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                postCtrl.photoUrl = image.src;
            });
        }

        postCtrl.isValid = function isValid(formInvalid) {
            if (postCtrl.user) {
                var post;
                if(!postCtrl.isEditing) {
                    post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                } else {
                    post = postCtrl.post;
                }
                return post.isValid() && !formInvalid;
            } else {
                return false;
            }
        };

        postCtrl.save = function save(isEditing, originalPost, posts, saveForm) {
            saveForm.$setPristine();
            saveForm.$setUntouched();
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
                        MessageService.showToast(response);
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
            postCtrl.loadingPost = true;
            deleteImage(postCtrl.post).then(function success() {
                postCtrl.loadingPost = false;
                saveEditedPost(originalPost);
            }, function error(error) {
                postCtrl.loadingPost = false;
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
                    postCtrl.loadingPost = true;
                    PostService.createPost(post).then(function success(response) {
                        postCtrl.clearPost();
                        posts.push(new Post(response));
                        MessageService.showToast('Postado com sucesso!');
                        changeTimelineToStart();
                        $mdDialog.hide();
                        postCtrl.loadingPost = false;
                        const postAuthorPermissions = ["edit_post", "remove_post"];
                        postCtrl.user.addPermissions(postAuthorPermissions, response.key);
                    }, function error() {
                        AuthService.reload().then(function success() {
                            $mdDialog.hide();
                            postCtrl.loadingPost = false;
                            $state.go("app.user.home");
                        });
                    });
                } else {
                    MessageService.showToast('Post inválido!');
                }
            });
            postCtrl.post.photo_url = null;
            postCtrl.post.pdf_files = [];
        };

        function changeTimelineToStart() {
            if (timelineContent) {
                timelineContent.scrollTop = 0;
            }
        }

        postCtrl.clearPost = function clearPost() {
            if (postCtrl.typePost === "Common") postCtrl.post = {};
            postCtrl.pdfFiles = [];
            postCtrl.hideImage();
            postCtrl.options = [];
            postCtrl.hasVideo = false;
        };

        postCtrl.showVideo = function showVideo() {
            return postCtrl.post.title && postCtrl.post.video_url;
        };

        postCtrl.showVideoUrlField = function showVideoUrlField() {
            var showField = postCtrl.hasVideo || postCtrl.post.video_url;
            return showField;
        };

        postCtrl.setHasVideo = function setHasVideo() {
            if(postCtrl.post.video_url || postCtrl.hasVideo) {
                postCtrl.hasVideo = false;
                postCtrl.post.video_url = "";
            } else {
                postCtrl.hasVideo = true;
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
            SubmitFormListenerService.unobserve("postCtrl.post");
            $mdDialog.hide();
        };

        postCtrl.showButton = function() {
            return postCtrl.post.title && !postCtrl.loading && postCtrl.typePost==='Common';
        };

        postCtrl.showImage = function() {
            var isImageEmpty = postCtrl.photoUrl === "";
            var isImageNull = postCtrl.photoUrl === null;
            return !isImageEmpty && !isImageNull;
        };

        postCtrl.showFiles = function() {
            var hasFiles = postCtrl.pdfFiles.length > 0;
            return hasFiles;
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

        postCtrl.isTyping = function() {
            return postCtrl.post.title || postCtrl.post.text || postCtrl.hasMedia();
        };

        postCtrl.showButton = function() {
            return postCtrl.typePost === 'Common' && postCtrl.isTyping() && 
                !postCtrl.loadingPost;
        };

        postCtrl.showPlaceholderMsg = function() {
            return postCtrl.isTyping() ? "Título" : "Escreva aqui uma nova publicação";
        };

        (function main() {
            if($scope.isEditing) {
                postCtrl.createEditedPost($scope.originalPost);
            }
            postCtrl.typePost = 'Common';
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