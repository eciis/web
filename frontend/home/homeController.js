'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService,
            InstitutionService, $interval, $mdToast, $mdDialog, $state, MessageService, ProfileService, EventService, $q) {
        var homeCtrl = this;

        var ACTIVE = "active";
        var LIMITE_EVENTS = 5;

        var morePosts = true;
        var actualPage = 0;

        homeCtrl.posts = [];
        homeCtrl.events = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.instMenuExpanded = false;
        homeCtrl.isLoadingPosts = true;

        homeCtrl.user = AuthService.getCurrentUser();

        homeCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        homeCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        homeCtrl.goToEvents = function goToEvents() {
            $state.go('app.events');
        };

        homeCtrl.goToEvent = function goToEvent(event) {
            $state.go('app.event', {eventKey: event.key});
        };

        homeCtrl.newPost = function newPost(event) {
            $mdDialog.show({
                controller: function PostDialogController() {},
                controllerAs: "controller",
                templateUrl: 'app/home/post_dialog.html',
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

        homeCtrl.loadMorePosts = function loadMorePosts(reload) {
            var deferred = $q.defer();

            if (reload) {
                actualPage = 0;
                morePosts = true;
                homeCtrl.posts.splice(0, homeCtrl.posts.length);
                homeCtrl.isLoadingPosts = true;
            }

            if (morePosts) {
                loadPosts(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        function loadPosts(deferred) {
            PostService.getNextPosts(actualPage).then(function success(response) {
                actualPage += 1;
                morePosts = response.data.next;

                _.forEach(response.data.posts, function(post) {
                    homeCtrl.posts.push(post);
                });

                homeCtrl.isLoadingPosts = false;
                deferred.resolve();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                deferred.reject();
            });
        }

        function getFollowingInstitutions(){
            homeCtrl.followingInstitutions = homeCtrl.user.follows;
        }

        function loadEvents() {
            var page = 0;
            EventService.getEvents(page).then(function success(response) {
                homeCtrl.events = activeEvents(response.data.events);
                homeCtrl.events = _.take(homeCtrl.events, LIMITE_EVENTS);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                    $state.go('app.home');
            });
        }

        function activeEvents(allEvents){
            var now = new Date();
            var actualEvents = _.remove(allEvents, function(event) {
                var end = new Date(event.end_time);
                if(end >= now){
                    return event;
                }
            });
            return actualEvents;
        }

        loadEvents();
        homeCtrl.loadMorePosts();
        getFollowingInstitutions();
    });
})();