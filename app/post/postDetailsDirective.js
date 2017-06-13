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
            var isPostAuthor = post.author_key == postDetailsCtrl.user.key;
            var isInstitutionMember = _.find(postDetailsCtrl.user.institutions, ['key', post.institution_key]);
            var isInstitutionAdmin = _.includes(_.map(postDetailsCtrl.user.institutions_admin, getKeyFromUrl), post.institution_key);
            if (isPostAuthor && isInstitutionMember || isInstitutionAdmin) {
                return true;
            }
            return false;
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

        var getComments = function getComments(post) {
            var commentsUri = post.comments;
            CommentService.getComments(commentsUri).then(function success(response) {
                postDetailsCtrl.comments[post.key] =  {'data': response.data, 'show': true};
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        postDetailsCtrl.showComments = function showComments(post) {
            var hasComments = postDetailsCtrl.comments[post.key];
            if(hasComments) {
                postDetailsCtrl.comments[post.key].show = !postDetailsCtrl.comments[post.key].show;
            } else {
                getComments(post);
            }
        };

        var addComment = function addComment(post, comment) {
            var postComments = postDetailsCtrl.comments[post.key].data;
            postComments.push(comment);
        };

        postDetailsCtrl.createComment = function createComment(post) {
            CommentService.createComment(post.key, postDetailsCtrl.newComment).then(function success(response) {
                postDetailsCtrl.newComment = '';
                addComment(post, response.data);
            }, function error(response) {
                showToast(response.data.msg);
            });
        };
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