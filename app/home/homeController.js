'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService, InstitutionService, $interval, $mdToast, $mdDialog, $state) {
        var homeCtrl = this;

        homeCtrl.posts = [];
        homeCtrl.institutions = [];

        homeCtrl.instMenuExpanded = false;

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
            var isPostAuthor = post.author_key == homeCtrl.user.key;
            var isInstitutionMember = _.find(homeCtrl.user.institutions, ['key', post.institution_key]);
            var isInstitutionAdmin = _.includes(_.map(homeCtrl.user.institutions_admin, getKeyFromUrl), post.institution_key);
            if (isPostAuthor && isInstitutionMember || isInstitutionAdmin) {
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
            PostService.likeOrDeslikePost(post).then(function success() {
                addPostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function deslikePost(post) {
            PostService.likeOrDeslikePost(post).then(function success() {
                removePostKeyFromUser(post.key);
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

        function removePostKeyFromUser(key) {
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

        homeCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        homeCtrl.newPost = function newPost(event) {
            $mdDialog.show({
                controller: "HomeController",
                controllerAs: "homeCtrl",
                templateUrl: 'home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };


        homeCtrl.expandInstMenu = function expandInstMenu(){
            homeCtrl.instMenuExpanded = !homeCtrl.instMenuExpanded;
        };

        homeCtrl.follow = function follow(institution){
            InstitutionService.follow(institution.key).then(function success(){
                showToast("Seguindo "+institution.name);
            });
           /**
           TODO: First version doesn't treat the case in which the user is already
           the institution follower.
           @author: Maiana Brito 01/06/2017
           **/
        };

        function getInstitutions(){
            InstitutionService.getInstitutions().then(function sucess(response){
                homeCtrl.institutions = response.data;
            });
        }

        var intervalPromise;

        var loadPosts = function loadPosts() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        loadPosts();
        getInstitutions();

        intervalPromise = $interval(loadPosts, 5000);
    });
})();