'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService,
            InstitutionService, CommentService, $interval, $mdToast, $mdDialog, $state) {
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

        homeCtrl.follow = function follow(institution){
            InstitutionService.follow(institution.key).then(function success(){
                showToast("Seguindo "+institution.name);
                homeCtrl.user.follow(institution.key);
            });

           /**
           TODO: First version doesn't treat the case in which the user is already
           the institution follower.
           @author: Maiana Brito 01/06/2017
           **/
        };

        homeCtrl.unfollow = function unfollow(institution){
            if(homeCtrl.user.isMember(institution.key)){
                showToast("Você não pode deixar de seguir " + institution.name);
            }
            else{
                InstitutionService.unfollow(institution.key).then(function sucess(){
                    showToast("Deixou de seguir "+institution.name);
                    homeCtrl.user.unfollow(institution.key);
                });
            }
        };

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

        /**
        FIXME: The timeline update interrupts the user while he is commenting on a post
        @author: Ruan Silveira 12/06/2017
        **/
        //intervalPromise = $interval(loadPosts, 15000);
    });
})();