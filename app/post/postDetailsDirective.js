(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PostDetailsController', function(PostService, AuthService, CommentService, $mdToast, $state,
        $mdDialog, NotificationService, MessageService) {
        var postDetailsCtrl = this;

        var LIMIT_CHARACTERS_POST = 1000;

        postDetailsCtrl.showLikes = false;
        postDetailsCtrl.showComments = false;
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
                    MessageService.showToast('Post excluído com sucesso');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            }, function() {
                MessageService.showToast('Cancelado');
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
            var hasNoComments = postDetailsCtrl.post.number_of_comments === 0;
            var hasNoLikes = postDetailsCtrl.post.number_of_likes === 0;

            return postDetailsCtrl.isPostAuthor() && !postDetailsCtrl.isDeleted() &&
                hasNoComments && hasNoLikes;
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

        postDetailsCtrl.editPost = function editPost(event) {
            $mdDialog.show({
                controller: function DialogController() {},
                controllerAs: "controller",
                templateUrl: 'home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    originalPost: postDetailsCtrl.post,
                    isEditing: true
                },
                bindToController: true
            }).then(function success(editedPost) {
                postDetailsCtrl.post.title = editedPost.title;
                postDetailsCtrl.post.text = editedPost.text;
                postDetailsCtrl.post.photo_url = editedPost.photo_url;
            }, function error() {});
        };

        function likePost() {
            postDetailsCtrl.savingLike = true;
            var promise = PostService.likePost(postDetailsCtrl.post);
            promise.then(function success() {
                addPostKeyToUser(postDetailsCtrl.post.key);
                postDetailsCtrl.post.number_of_likes += 1;
                postDetailsCtrl.savingLike = false;
                postDetailsCtrl.getLikes(postDetailsCtrl.post);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
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
            AuthService.save();
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
        }

        postDetailsCtrl.goToInstitution = function goToInstitution() {
            $state.go('app.institution', {institutionKey: postDetailsCtrl.post.institution_key});
        };

        postDetailsCtrl.goToPost = function goToPost() {
             $state.go('app.post', {key: postDetailsCtrl.post.key});
        };

        postDetailsCtrl.getValues = function getValues(object) {
            return _.values(object);
        };

        postDetailsCtrl.getComments = function getComments() {
            var commentsUri = postDetailsCtrl.post.comments;
            postDetailsCtrl.showComments = !postDetailsCtrl.showComments;
            if (postDetailsCtrl.showComments){
                var promise  =  CommentService.getComments(commentsUri);
                promise.then(function success(response) {
                    postDetailsCtrl.post.data_comments = response.data;
                    postDetailsCtrl.post.number_of_comments = _.size(postDetailsCtrl.post.data_comments);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
                return promise;
            } else {
                postDetailsCtrl.post.data_comments = [];
            }
        };

        postDetailsCtrl.getLikes = function getLikes() {
            var likesUri = postDetailsCtrl.post.likes;
            postDetailsCtrl.showLikes = !postDetailsCtrl.showLikes;
            if(postDetailsCtrl.showLikes) {
                var promise = PostService.getLikes(likesUri);
                promise.then(function success(response) {
                    postDetailsCtrl.post.data_likes = response.data;
                    postDetailsCtrl.post.number_of_likes = _.size(postDetailsCtrl.post.data_likes);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
                return promise;
            }else{
                postDetailsCtrl.post.data_likes = [];
            }
        };

        function addComment(post, comment) {
            var postComments = postDetailsCtrl.post.data_comments;
            postComments[comment.id] = comment;
            post.number_of_comments += 1;
        }

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
                    AuthService.reload().then(function success() {
                        postDetailsCtrl.savingComment = false;
                        MessageService.showToast(response.data.msg);
                        $state.go('app.home');
                    });
                });
            } else {
                MessageService.showToast("Comentário não pode ser vazio.");
            }
            return promise;
        };

        postDetailsCtrl.replyComment = function replyComment(comment, reply, showReply) {
            var institutionKey = postDetailsCtrl.user.current_institution.key;
            var promise = CommentService.replyComment(
                postDetailsCtrl.post.key, reply, institutionKey, comment.id
            );

            promise.then(function success(response) {
                showReply = false;
                reply = response.data;
                comment.replies[reply.id] = reply;
            },function error(error) {
                MessageService.showToast(error.data.msg);
            });
        };

        postDetailsCtrl.canDeleteComment = function canDeleteComment(comment) {
            return isCommentAuthor(comment) && _.isEmpty(comment.replies);
        };

        function showDeleteDialog() {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Comentário')
                .textContent('Este comentário será excluído e desaparecerá do referente post.')
                .ariaLabel('Deletar comentário')
                .targetEvent(event)
                .ok('Excluir')
                .cancel('Cancelar');

            return $mdDialog.show(confirm);
        }

        postDetailsCtrl.deleteComment = function deleteComment(event, comment) {
            showDeleteDialog().then(function() {
                CommentService.deleteComment(postDetailsCtrl.post.key, comment.id).then(
                    function success(response) {
                        removeCommentFromPost(response.data);
                        MessageService.showToast('Comentário excluído com sucesso');
                        postDetailsCtrl.post.number_of_comments -= 1;
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    }
                );
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        postDetailsCtrl.deleteReply = function postDetailsCtrl(event, post, comment, reply) {
            showDeleteDialog().then(function() {
                CommentService.deleteReply(post.key, comment.id, reply.id).then(
                    function success() {
                        delete comment.replies[reply.id];
                        MessageService.showToast('Comentário excluído com sucesso');
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    }
                );
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        function removeCommentFromPost(comment) {
            var postComments = postDetailsCtrl.post.data_comments;
            delete postComments[comment.id];
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

        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
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
            var urlsInText = post.text.match(URL_PATTERN);
            post.text = addHttpsToUrl(post.text, urlsInText);
            post.text = adjustText(post.text);
            return post;
        };

        postDetailsCtrl.showImage = function() {
            var imageEmpty = postDetailsCtrl.post.photo_url === "";
            var imageNull = postDetailsCtrl.post.photo_url === null;
            var deletedPost = postDetailsCtrl.post.state === 'deleted';
            return !imageEmpty && !imageNull && !deletedPost;
        };

        postDetailsCtrl.isLongPostTimeline = function(text){
            var qtdChar = text.length;
            return !postDetailsCtrl.isPostPage && qtdChar >= LIMIT_CHARACTERS_POST;
        };

        function adjustText(text){
            if(postDetailsCtrl.isLongPostTimeline(text)){
                text = text.substring(0, LIMIT_CHARACTERS_POST) + "...";
            }
            return text.replace(URL_PATTERN,REPLACE_URL);
        }

        function addHttpsToUrl(text, urls) {
            if(urls) {
                var http = "http://";
                for (var i = 0; i < urls.length; i++) {
                    if(urls[i].slice(0, 4) !== "http") {
                        text = text.replace(urls[i], http + urls[i]);
                    }
                }
            }
            return text;
        }
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
                isPostPage: '='
            }
        };
    });
})();