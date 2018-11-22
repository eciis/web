'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService, NotificationService,
            $mdSidenav, $mdDialog, $state, ProfileService, EventService, $q) {
        var homeCtrl = this;

        var ACTIVE = "active";
        var LIMITE_EVENTS = 5;

        var morePosts = true;
        var actualPage = 0;

        homeCtrl.posts = [];
        homeCtrl.events = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.refreshTimeline = false;
        homeCtrl.instMenuExpanded = false;
        homeCtrl.isLoadingPosts = true;
        homeCtrl.showMessageOfEmptyEvents = true;
        homeCtrl.stateView = "";

        homeCtrl.user = AuthService.getCurrentUser();
        function loadStateView(){
            homeCtrl.stateView = getStateView($state.current.name);
        }

        function getStateView (state) {
            return state.split(".")[2];
        }
 
        homeCtrl.getSelectedItemClass = function getSelectedItemClass(state){
            loadStateView();
             return (state === homeCtrl.stateView) ? "option-selected-left-bar":"";
         };

        homeCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
        };

        homeCtrl.eventInProgress = function eventInProgress(event) {
            var end_time = event.end_time;
            var date = new Date();
            var current_time = date.toISOString().substr(0, end_time.length);

            if (current_time <= end_time) {
                homeCtrl.showMessageOfEmptyEvents = false;
            }

            return current_time <= end_time;
        };

        homeCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        function go(state, params={}) {
            homeCtrl.stateView = getStateView(state);
            $state.go(state, params);
            $mdSidenav('leftNav').toggle();
        }

        homeCtrl.goHome = function goHome() {
            go('app.user.home');
        };

        homeCtrl.goToProfile = function goToProfile() {
            go('app.user.config_profile');
        };

        homeCtrl.goToEvents = function goToEvents() {
            go('app.user.events', {posts: homeCtrl.posts});
        };

        homeCtrl.goToInstitutions = function goToInstitutions() {
            go('app.user.institutions');
        };

        homeCtrl.goInvite = function goInvite() {
            go('app.user.invite_inst');
        };

        homeCtrl.goToEvent = function goToEvent(event) {
            $state.go('app.user.event', {eventKey: event.key, posts: homeCtrl.posts});
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
                homeCtrl.setRefreshTimelineButton();
                homeCtrl.isLoadingPosts = true;
            }

            if (morePosts) {
                loadPosts(deferred);
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        };

        homeCtrl.isEventsEmpty = function isEventsEmpty() {
            return homeCtrl.events.length === 0 || homeCtrl.showMessageOfEmptyEvents;
        };

        homeCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
            return homeCtrl.refreshTimeline;
         };

        homeCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            homeCtrl.refreshTimeline = !homeCtrl.refreshTimeline;
        };

        homeCtrl.openColorPicker = function openColorPicker(){
             $mdDialog.show({
                controller: "ColorPickerController",
                controllerAs: "colorPickerCtrl",
                templateUrl: 'app/home/color_picker.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                locals: {
                    user : homeCtrl.user
                },
                 bindToController: true
            });
        };

        function loadPosts(deferred) {
            PostService.getNextPosts(actualPage).then(function success(response) {
                actualPage += 1;
                morePosts = response.next;

                _.forEach(response.posts, function(post) {
                    homeCtrl.posts.push(post);
                });

                homeCtrl.isLoadingPosts = false;
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
        }

        function getFollowingInstitutions(){
            homeCtrl.followingInstitutions = homeCtrl.user.follows;
        }

        function loadEvents() {
            var page = 0;
            EventService.getEvents(page).then(function success(response) {
                homeCtrl.events = activeEvents(response.events);
                homeCtrl.events = _.take(homeCtrl.events, LIMITE_EVENTS);
            }, function error() {
                $state.go("app.user.home");
            });
        }

        function activeEvents(allEvents){
            var now = new Date();
            var actualEvents = _.clone(allEvents);
            _.remove(actualEvents, function(event) {
                var end = new Date(event.end_time);
                return end <= now;
            });
            return actualEvents;
        }

        homeCtrl.takeTour = function takeTour(event) {
            $mdDialog.show({
                templateUrl: 'app/invites/welcome_dialog.html',
                controller: function WelcomeController() {
                    var controller = this;
                    controller.next = false;
                    controller.cancel = function() {
                        $mdDialog.cancel();
                    };
                },
                controllerAs: "controller",
                targetEvent: event,
                clickOutsideToClose: false
            });
        };

        (function main() {
            NotificationService.watchPostNotification(homeCtrl.user.key, homeCtrl.setRefreshTimelineButton);
            loadEvents();
            homeCtrl.loadMorePosts();
            getFollowingInstitutions();
            loadStateView();
        })();
    });
})();