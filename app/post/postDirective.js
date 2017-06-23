   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("PostController", function PostController($mdDialog, PostService, AuthService, $mdToast, $state, $q, $rootScope, $timeout) {
        var postCtrl = this;

        postCtrl.post = {};

        postCtrl.isPostValid = function isPostValid() {
            if (postCtrl.user) {
                var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
                return post.isValid();
            } else {
                return false;
            }
        };

        postCtrl.createPost = function createPost() {
            var post = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            if (post.isValid()) {
                PostService.createPost(post).then(function success(response) {
                    postCtrl.clearPost();
                    showToast('Postado com sucesso!');
                    $mdDialog.hide();
                    $rootScope.$broadcast("reloadPosts", response.data);
                }, function error(response) {
                    $mdDialog.hide();
                    showToast(response.data.msg);
                });
            } else {
                showToast('Post inválido!');
            }
        };

        postCtrl.cancelDialog = function() {
            $mdDialog.hide();
        };

        postCtrl.clearPost = function clearPost() {
            postCtrl.post = {};
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

    app.directive("createPost", function() {
        return {
            restrict: 'E',
            templateUrl: "post/new_post.html",
            controllerAs: "postCtrl",
            controller: "PostController",
            scope: {
                user: '=',
                isDialog: '=',
            },
            bindToController: true
        };
    });
})();