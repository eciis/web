'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService,
            InstitutionService, $interval, $mdToast, $mdDialog, $state, MessageService, ProfileService, EventService) {
        var homeCtrl = this;

        var ACTIVE = "active";

        homeCtrl.posts = [];
        homeCtrl.events = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.instMenuExpanded = false;

        homeCtrl.user = AuthService.getCurrentUser();

        homeCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        homeCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        homeCtrl.goToEvents = function goToEvents() {
            $state.go('app.event');
        };

        homeCtrl.newPost = function newPost(event) {
            $mdDialog.show({
                controller: function PostDialogController() {},
                controllerAs: "controller",
                templateUrl: 'home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post')),
                locals: {
                    posts: homeCtrl.posts,
                    isEditing: false
                },
                bindToController: true
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

        var loadPosts = function loadPosts() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        };

        function loadEvents() {
            EventService.getEvents().then(function success(response) {
                homeCtrl.events = activeEvents(response.data);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                    $state.go('app.home');
            });
        }

        function activeEvents(allEvents){
            var now = new Date();
            var actualEvents = [];
            for (var i = 0; i < allEvents.length - 1; i++) {
                var end = new Date(allEvents[i].end_time);
                if(end >= now){
                    actualEvents.push(allEvents[i]);
                }
            }
            return actualEvents;
        }

        loadEvents();
        loadPosts();
        getFollowingInstitutions();
    });
})();