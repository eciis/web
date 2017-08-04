(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PostDetailsController', function(PostService, AuthService, CommentService, $mdToast, $state,
        $mdDialog) {
        var postDetailsCtrl = this;

        postDetailsCtrl.seeLikes = false;
        postDetailsCtrl.seeComments = false;

        postDetailsCtrl.savingComment = false;
        postDetailsCtrl.savingLike = false;

        postDetailsCtrl.user = AuthService.getCurrentUser();

        postDetailsCtrl.deletePost = function deletePost(ev, post) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Post')
                .textContent('Este post será excluído e desaparecerá para os usuários que seguem a instituição.')
                .ariaLabel('Deletar postagem')
                .targetEvent(ev)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                PostService.deletePost(post).then(function success() {
                    postDetailsCtrl.post.state = 'deleted';
                    showToast('Post excluído com sucesso');
                }, function error(response) {
                    showToast(response.data.msg);
                });
            }, function() {
                showToast('Cancelado');
            });
        };

        postDetailsCtrl.isAuthorized = function isAuthorized() {
            return postDetailsCtrl.isPostAuthor() || isInstitutionAdmin();
        };

        postDetailsCtrl.isDeleted = function isDeleted() {
            return postDetailsCtrl.post.state == 'deleted';
        };

         postDetailsCtrl.showButtonDelete = function showButtonDelete() {
            return postDetailsCtrl.isAuthorized() &&
                !postDetailsCtrl.isDeleted();
        };

        postDetailsCtrl.disableButtonLike = function disableButtonLike() {
            return postDetailsCtrl.savingLike || postDetailsCtrl.isDeleted();
        };

        postDetailsCtrl.showButtonEdit = function showButtonDeleted() {
            return postDetailsCtrl.isPostAuthor() &&
                !postDetailsCtrl.isDeleted();
        };

        postDetailsCtrl.likeOrDislikePost = function likeOrDislikePost() {
            var promise;
            if(!postDetailsCtrl.isLikedByUser()) {
                promise = likePost();
            } else {
                promise = dislikePost();
            }
            return promise;
        };

        postDetailsCtrl.editPost = function editPost(post, event) {
            $mdDialog.show({
                controller: "EditPostController",
                controllerAs: "editPostCtrl",
                templateUrl: 'home/edit_post.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    user : postDetailsCtrl.user,
                    post: post
                }
            }).then(function success(editedPost) {
                postDetailsCtrl.post.title = editedPost.title;
                postDetailsCtrl.post.text = editedPost.text;
            });
        };

        function likePost() {
            postDetailsCtrl.savingLike = true;
            var promise = PostService.likePost(postDetailsCtrl.post);
            promise.then(function success() {
                addPostKeyToUser(postDetailsCtrl.post.key);
                postDetailsCtrl.post.number_of_likes += 1;
                postDetailsCtrl.savingLike = false;
                postDetailsCtrl.getLikes(postDetailsCtrl.post);
            }, function error() {
                $state.go('app.home');
                postDetailsCtrl.savingLike = false;
            });
            return promise;
        }

        function dislikePost() {
            postDetailsCtrl.savingLike = true;
            var promise = PostService.dislikePost(postDetailsCtrl.post);
            promise.then(function success() {
                removePostKeyFromUser(postDetailsCtrl.post.key);
                postDetailsCtrl.post.number_of_likes -= 1;
                postDetailsCtrl.savingLike = false;
                postDetailsCtrl.getLikes(postDetailsCtrl.post);
            }, function error() {
                $state.go('app.home');
                postDetailsCtrl.savingLike = false;
            });
            return promise;
        }

        postDetailsCtrl.isLikedByUser = function isLikedByUser() {
            var likedPostsKeys = _.map(postDetailsCtrl.user.liked_posts, getKeyFromUrl);
            return _.includes(likedPostsKeys, postDetailsCtrl.post.key);
        };

        function addPostKeyToUser(key) {
            postDetailsCtrl.user.liked_posts.push(key);
            AuthService.save();

        }

        function removePostKeyFromUser(key) {
            _.remove(postDetailsCtrl.user.liked_posts, foundPost => getKeyFromUrl(foundPost) === key);
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
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

        postDetailsCtrl.goToInstitution = function goToInstitution() {
            $state.go('app.institution', {institutionKey: postDetailsCtrl.post.institution_key});
        };

        postDetailsCtrl.goToPost = function goToPost() {
             $state.go('app.post', {postKey: postDetailsCtrl.post.key});
         };

        postDetailsCtrl.getComments = function getComments() {
            var commentsUri = postDetailsCtrl.post.comments;
            postDetailsCtrl.seeComments = !postDetailsCtrl.seeComments;
            if (postDetailsCtrl.seeComments){
                var promise  =  CommentService.getComments(commentsUri);
                promise.then(function success(response) {
                    postDetailsCtrl.post.data_comments = response.data;
                    
                postDetailsCtrl.post.number_of_comments = _.size(postDetailsCtrl.post.data_comments);
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            } else{
                postDetailsCtrl.post.data_comments = [];
            }
            
        };

        postDetailsCtrl.getLikes = function getLikes() {
            console.log("entra em get likes");
            var likesUri = postDetailsCtrl.post.likes;
            postDetailsCtrl.seeLikes = !postDetailsCtrl.seeLikes;
            if(postDetailsCtrl.seeLikes) {
                var promise = PostService.getLikes(likesUri);
                promise.then(function success(response) {
                    postDetailsCtrl.post.data_likes = response.data;
                    postDetailsCtrl.post.number_of_likes = _.size(postDetailsCtrl.post.data_likes);
                    
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }else{
                postDetailsCtrl.post.data_likes = [];
            }
            
        };

        var addComment = function addComment(post, comment) {
            var postComments = postDetailsCtrl.post.data_comments;
            postComments.push(comment);
            post.number_of_comments += 1;
        };

        postDetailsCtrl.createComment = function createComment() {
            var newComment = postDetailsCtrl.newComment;
            var institutionKey = postDetailsCtrl.user.current_institution.key;
            var promise;
            if (!_.isEmpty(newComment)) {
                postDetailsCtrl.savingComment = true;
                promise = CommentService.createComment(postDetailsCtrl.post.key, newComment, institutionKey);
                promise.then(function success(response) {
                    postDetailsCtrl.newComment = '';
                    addComment(postDetailsCtrl.post, response.data);
                    postDetailsCtrl.savingComment = false;
                }, function error(response) {
                    postDetailsCtrl.savingComment = false;
                    showToast(response.data.msg);
                });
            } else {
                showToast("Comentário não pode ser vazio.");
            }
            return promise;
        };

        postDetailsCtrl.canDeleteComment = function canDeleteComment(comment) {
            return isCommentAuthor(comment);
        };

        postDetailsCtrl.deleteComment = function deleteComment(event, comment) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Comentário')
                .textContent('Este comentário será excluído e desaparecerá do referente post.')
                .ariaLabel('Deletar comentário')
                .targetEvent(event)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                CommentService.deleteComment(postDetailsCtrl.post.key, comment.id).then(function success(response) {
                    removeCommentFromPost(response.data);
                    showToast('Comentário excluído com sucesso');
                    postDetailsCtrl.post.number_of_comments -= 1;
                }, function error(response) {
                    showToast(response.data.msg);
                });
            }, function() {
                showToast('Cancelado');
            });
        };

        function removeCommentFromPost(comment) {
            var postComments = postDetailsCtrl.post.data_comments;
            _.remove(postComments, function(postComment) {
                return postComment.id == comment.id;
            });
        }

        postDetailsCtrl.isPostAuthor = function isPostAuthor() {
            return postDetailsCtrl.post.author_key == postDetailsCtrl.user.key;
        };

        function isCommentAuthor(comment) {
            return comment.author_key == postDetailsCtrl.user.key;
        }

        function isInstitutionAdmin() {
            return _.includes(_.map(postDetailsCtrl.user.institutions_admin, getKeyFromUrl), postDetailsCtrl.post.institution_key);
        }

        var URL_PATTERN = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";

        /**
        * replace urls in a string with links to make the urls clickable.
        * If urls don't containing http or https, this function add the https.
        * @param {object} receivedPost - The post to be recognized.
        * @return {object} The post with clickable urls.
        * OBS: This function returns a new Post because this result is only for show in view.
        * It is not necessary to change the original Post.
        */
        postDetailsCtrl.recognizeUrl =  function recognizeUrl(receivedPost) {
            var post = new Post(receivedPost, receivedPost.institutionKey);
            var urlsInTitle = post.title.match(URL_PATTERN);
            var urlsInText = post.text.match(URL_PATTERN);
            post.title = addHttpsToUrl(post.title, urlsInTitle);
            post.text = addHttpsToUrl(post.text, urlsInText);
            post.title = post.title.replace(URL_PATTERN, REPLACE_URL);
            post.text = post.text.replace(URL_PATTERN,REPLACE_URL);
            return post;
        };

        function addHttpsToUrl(text, urls) {
            if(urls) {
                var https = "https://";
                for (var i = 0; i < urls.length; i++) {
                    if(urls[i].slice(0, 4) != "http") {
                        text = text.replace(urls[i], https + urls[i]);
                    }
                }
            }
            return text;
        }
    });

    app.directive("timeline", function() {
        return {
            restrict: 'E',
            templateUrl: "post/timeline.html",
            scope: {
                posts: '=',
                institution: '=',
                user: '='
            }
        };
    });

    app.directive("postDetails", function() {
        return {
            restrict: 'E',
            templateUrl: "post/post_details.html",
            controllerAs: "postDetailsCtrl",
            controller: "PostDetailsController",
            scope: {},
            bindToController: {
                post: '=',
                pagepost: '@'
            }
        };
    });

    app.controller("EditPostController", function PostController(user, post, $mdDialog, PostService, AuthService, $mdToast) {
        var postCtrl = this;

        postCtrl.user = user;

        // Original post to compare and generate PATCH actions.
        postCtrl.post = new Post(post, postCtrl.user.current_institution.key);

        // Copy of post to edit.
        postCtrl.newPost = new Post(post, postCtrl.user.current_institution.key);

        postCtrl.isPostValid = function isPostValid() {
            if (postCtrl.user) {
                return postCtrl.newPost.isValid();
            } else {
                return false;
            }
        };

        postCtrl.editPost = function editPost() {
            if (postCtrl.newPost.isValid()) {
                PostService.save(postCtrl.post, postCtrl.newPost).then(function success() {
                    showToast('Publicação editada com sucesso!');
                    $mdDialog.hide(postCtrl.newPost);
                }, function error(response) {
                    $mdDialog.cancel();
                    showToast(response.data.msg);
                });
            } else {
                showToast('Edição inválida!');
            }
        };

        postCtrl.cancelDialog = function() {
            $mdDialog.cancel();
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
})();