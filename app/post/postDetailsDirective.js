(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PostDetailsController', function(PostService, AuthService, CommentService, $mdToast, $state,
        $mdDialog) {
        var postDetailsCtrl = this;

        postDetailsCtrl.comments = {};
        postDetailsCtrl.newComment = '';

        Object.defineProperty(postDetailsCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        postDetailsCtrl.deletePost = function deletePost(ev, post, posts) {
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
                    _.remove(posts, foundPost => foundPost.key === post.key);
                    showToast('Post excluído com sucesso');
                }, function error(response) {
                    showToast(response.data.msg);
                });
            }, function() {
                showToast('Cancelado');
            });
        };

        postDetailsCtrl.isAuthorized = function isAuthorized(post) {
            return isPostAuthor(post) || isInstitutionAdmin(post);        
        };

        postDetailsCtrl.likeOrDislikePost = function likeOrDislikePost(post) {
            if(!postDetailsCtrl.isLikedByUser(post)) {
                likePost(post);
            } else {
                dislikePost(post);
            }
        };

        function likePost(post) {
            PostService.likePost(post).then(function success() {
                addPostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function dislikePost(post) {
            PostService.dislikePost(post).then(function success() {
                removePostKeyFromUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        postDetailsCtrl.isLikedByUser = function isLikedByUser(post) {
            var likedPostsKeys = _.map(postDetailsCtrl.user.liked_posts, getKeyFromUrl);
            return _.includes(likedPostsKeys, post.key);
        };

        function addPostKeyToUser(key) {
            postDetailsCtrl.user.liked_posts.push(key);
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

        postDetailsCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        postDetailsCtrl.getComments = function getComments(post) {
            var commentsUri = post.comments;
            CommentService.getComments(commentsUri).then(function success(response) {
                var comments = postDetailsCtrl.comments[post.key];
                if(comments) {
                    postDetailsCtrl.comments[post.key].data = response.data;
                    postDetailsCtrl.comments[post.key].show = !postDetailsCtrl.comments[post.key].show;  
                } else {
                    postDetailsCtrl.comments[post.key] =  {'data': response.data, 'show': true, 'newComment': ''};
                }              
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        var addComment = function addComment(post, comment) {
            var postComments = postDetailsCtrl.comments[post.key].data;
            postComments.push(comment);
            post.number_of_comments += 1;
        };

        postDetailsCtrl.createComment = function createComment(post) {
            var newComment = postDetailsCtrl.comments[post.key].newComment;
            CommentService.createComment(post.key, newComment).then(function success(response) {
                postDetailsCtrl.comments[post.key].newComment = '';
                addComment(post, response.data);
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        postDetailsCtrl.canDeleteComment = function canDeleteComment(post, comment) {
            return isCommentAuthor(comment) || isPostAuthor(post) || isInstitutionAdmin(post);
        };

        postDetailsCtrl.deleteComment = function deleteComment(event, post, comment) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Comentário')
                .textContent('Este comentário será excluído e desaparecerá do referente post.')
                .ariaLabel('Deletar comentário')
                .targetEvent(event)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                CommentService.deleteComment(post.key, comment.id).then(function success(response) {
                    removeCommentFromPost(post, response.data);
                    showToast('Comentário excluído com sucesso');
                    post.number_of_comments -= 1;
                }, function error(response) {
                    showToast(response.data.msg);
                });
            }, function() {
                showToast('Cancelado');
            });
        };

        postDetailsCtrl.textNumberComment = function textNumberComment(post) {
            var numeral =  post.number_of_comments == 1? 'Comentário' : 'Comentários';
            return post.number_of_comments + " " + numeral;
        };

        function removeCommentFromPost(post, comment) {
            var postComments = postDetailsCtrl.comments[post.key].data;
            _.remove(postComments, function(postComment) {
                return postComment.id == comment.id; 
            });
        }

        function isPostAuthor(post) {
            return post.author_key == postDetailsCtrl.user.key;
        }

        function isCommentAuthor(comment) {
            return comment.author_key == postDetailsCtrl.user.key;
        }

        function isInstitutionAdmin(post) {
            return _.includes(_.map(postDetailsCtrl.user.institutions_admin, getKeyFromUrl), post.institution_key);
        }
    });

    app.directive("postDetails", function() {
        return {
            restrict: 'E',
            templateUrl: "post/post_details.html",
            controllerAs: "postDetailsCtrl",
            controller: "PostDetailsController",
            scope: {
                posts: '='
            }
        };
    });
})();