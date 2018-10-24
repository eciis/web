'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(AuthService, $mdDialog, $state, 
        ProfileService, EventService, $rootScope) {
        var homeCtrl = this;

        var ACTIVE = "active";
        var LIMITE_EVENTS = 5;

        const NEW_POST_EVENT_TO_SEND = 'NEW-POST';
        const NEW_POST_EVENT_TO_RECEIVE = 'NEW-POST-EVENT';

        homeCtrl.events = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.instMenuExpanded = false;
        homeCtrl.isLoadingPosts = true;
        homeCtrl.showMessageOfEmptyEvents = true;
        homeCtrl.stateView = "";

        homeCtrl.user = AuthService.getCurrentUser();
        function loadStateView(){
            homeCtrl.stateView = $state.current.name.split(".")[2];
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

        homeCtrl.goHome = function goHome() {
            homeCtrl.stateView = "home";
            $state.go('app.user.home');
        };

        homeCtrl.goToProfile = function goToProfile() {
            homeCtrl.stateView = "config_profile";
            $state.go('app.user.config_profile');
        };

        homeCtrl.goToEvents = function goToEvents() {
            homeCtrl.stateView = "events";
            $state.go('app.user.events', {posts: homeCtrl.posts});
        };

        homeCtrl.goToInstitutions = function goToInstitutions() {
            homeCtrl.stateView = "institutions";
            $state.go('app.user.institutions');
        };

        homeCtrl.goInvite = function goInvite() {
            homeCtrl.stateView = "invite_inst";
            $state.go('app.user.invite_inst');
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

        homeCtrl.isEventsEmpty = function isEventsEmpty() {
            return homeCtrl.events.length === 0 || homeCtrl.showMessageOfEmptyEvents;
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

        function registerNewPostEvent() {
            $rootScope.$on(NEW_POST_EVENT_TO_RECEIVE, (event, data) => {
                broadcastNewPostEvent(data);
            });
        }

        function broadcastNewPostEvent(post) {
            $rootScope.$broadcast(NEW_POST_EVENT_TO_SEND, post);
        }

        (function main() {
            loadEvents();
            getFollowingInstitutions();
            loadStateView();
            registerNewPostEvent();
        })();
    });
})();