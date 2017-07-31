'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService,
            InstitutionService, $interval, $mdToast, $mdDialog, $state, $rootScope) {
        var homeCtrl = this;

        var ACTIVE = "active";

        homeCtrl.posts = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.instMenuExpanded = false;

        homeCtrl.user = AuthService.getCurrentUser();

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
        
        homeCtrl.isActive = function isActive(institution) {
            return institution.state === ACTIVE;
        };

        function getFollowingInstitutions(){
            homeCtrl.followingInstitutions = homeCtrl.user.follows;
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
        getFollowingInstitutions();

        $rootScope.$on("reloadPosts", function(event, data) {
            var post = new Post(data);
            homeCtrl.posts.push(post);
        });

        /**
        FIXME: The timeline update interrupts the user while he is commenting on a post
        @author: Ruan Silveira 12/06/2017
        **/
        //intervalPromise = $interval(loadPosts, 15000);
    });
})();