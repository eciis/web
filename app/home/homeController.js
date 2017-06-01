'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService, $interval, $mdToast, $mdDialog) {
        var homeCtrl = this;
        
        homeCtrl.posts = [];

        Object.defineProperty(homeCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        var intervalPromise;

        var loadPosts = function loadPosts() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        homeCtrl.deletePost = function deletePost(ev, post) {
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
                    _.remove(homeCtrl.posts, foundPost => foundPost.key === post.key);
                    showToast('Post excluído com sucesso');
                }, function error(response) {
                    showToast(response.data.msg);
                });
            }, function() {
                showToast('Cancelado');
            });
        };

        homeCtrl.isAuthorized = function isAuthorized(post) {
            if ((post.author_key == homeCtrl.user.key && 
                _.find(homeCtrl.user.institutions, ['key', post.institution_key])) || 
                _.includes(_.map(homeCtrl.user.institutions_admin, getKeyFromUrl), post.institution_key)) {
                return true;
            }
            return false;
        };

        homeCtrl.likeOrDeslikePost = function likeOrDeslikePost(post) {
            if(!homeCtrl.isLikedByUser(post)) {
                likePost(post);
            } else {
                deslikePost(post);
            }
        };

        function likePost(post) {
            PostService.likePost(post).then(function success() {
                addPostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function deslikePost(post) {
            PostService.deslikePost(post).then(function success() {
                removePostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        homeCtrl.isLikedByUser = function isLikedByUser(post) {
            var likedPostsKeys = _.map(homeCtrl.user.liked_posts, getKeyFromUrl);
            return _.includes(likedPostsKeys, post.key);
        };

        function addPostKeyToUser(key) {
            homeCtrl.user.liked_posts.push(key);
        }

        function removePostKeyToUser(key) {
            _.remove(homeCtrl.user.liked_posts, foundPost => getKeyFromUrl(foundPost) === key);
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
        }

        loadPosts();

        intervalPromise = $interval(loadPosts, 5000);

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