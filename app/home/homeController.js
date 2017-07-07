'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService,
            InstitutionService, CommentService, $interval, $mdToast, $mdDialog, $state, $rootScope) {
        var homeCtrl = this;

        homeCtrl.posts = [];
        homeCtrl.comments = {};
        homeCtrl.institutions = [];
        homeCtrl.newComment = '';

        homeCtrl.instMenuExpanded = false;

        Object.defineProperty(homeCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

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

        function getInstitutions(){
            InstitutionService.getInstitutions().then(function sucess(response){
                homeCtrl.institutions = response.data;
            });
        }

        var intervalPromise;

        var loadPosts = function loadPosts() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
                _.map(homeCtrl.posts, recognizeUrl);
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        loadPosts();
        getInstitutions();

        $rootScope.$on("reloadPosts", function(event, data) {
            var post = new Post(data);
            recognizeUrl(post);
            homeCtrl.posts.push(post);
        });

        function recognizeUrl(post) {
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            post.text = post.text.replace(exp,"<a href=\"$1\" target='_blank'>$1</a>");
        }
        /**
        FIXME: The timeline update interrupts the user while he is commenting on a post
        @author: Ruan Silveira 12/06/2017
        **/
        //intervalPromise = $interval(loadPosts, 15000);
    });
})();