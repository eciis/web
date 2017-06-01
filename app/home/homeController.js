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
                _.includes(getKeysFromUrlArray(homeCtrl.user.institutions_admin), post.institution_key)) {
                return true;
            }
            return false;
        };

        var intervalPromise;

        var loadPosts = function() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        homeCtrl.likePost = function(post) {
            PostService.likePost(post).then(function success() {
                addPostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        homeCtrl.isLikedByUser = function isLikedByUser(post) {
            var likedPosts = homeCtrl.user ? homeCtrl.user.liked_posts : [];
            var likedPostsKeys = _.map(likedPosts, getKeyFromUrl);
            return _.includes(likedPostsKeys, post.key);
        };

        function addPostKeyToUser(key) {
            homeCtrl.user.liked_posts.push(key);
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
        }

        function getKeysFromUrlArray(urlArray) {
            var keys = [];
            _.forEach(urlArray, function(url) {
                keys.push(getKeyFromUrl(url));
            });
            return keys;
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

        homeCtrl.newPost = function newPost(event) {
            $mdDialog.show({
                controller: "HomeController",
                controllerAs: "ctrl",
                templateUrl: 'home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };
    });
})();