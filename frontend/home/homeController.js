'use strict';

(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(AuthService, $mdDialog, 
        $state, EventService, ProfileService, $rootScope, POST_EVENTS, STATES, UtilsService) {
        var homeCtrl = this;

        var ACTIVE = "active";
        var LIMITE_EVENTS = 5;

        homeCtrl.events = [];
        homeCtrl.followingInstitutions = [];
        homeCtrl.instMenuExpanded = false;
        homeCtrl.isLoadingPosts = true;
        homeCtrl.showMessageOfEmptyEvents = true;

        homeCtrl.user = AuthService.getCurrentUser();
        
        homeCtrl.getSelectedClass = function (stateName){
            return $state.current.name === STATES[stateName] ? "selected" : "";
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
            UtilsService.selectNavOption(STATES.HOME);
        };

        homeCtrl.goToProfile = function goToProfile() {
            UtilsService.selectNavOption(STATES.CONFIG_PROFILE);
        };

        homeCtrl.goToEvents = function goToEvents() {
            UtilsService.selectNavOption(STATES.EVENTS, {posts: homeCtrl.posts});
        };

        homeCtrl.goToInstitutions = function goToInstitutions() {
            UtilsService.selectNavOption(STATES.USER_INSTITUTIONS);
        };

        homeCtrl.goInvite = function goInvite() {
            UtilsService.selectNavOption(STATES.INVITE_INSTITUTION);
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
                $state.go(STATES.HOME);
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

        /**
         * Start the listeners to new post and delete post events.
         * broadCasts the event to the hierachy by calling broadcastPostEvent() 
         * when there is a new event.
         */
        function registerPostEvents() {
            $rootScope.$on(POST_EVENTS.NEW_POST_EVENT_TO_UP, (event, data) => {
                broadcastPostEvent(POST_EVENTS.NEW_POST_EVENT_TO_DOWN, data);
            });

            $rootScope.$on(POST_EVENTS.DELETED_POST_EVENT_TO_UP, (event, data) => {
                broadcastPostEvent(POST_EVENTS.DELETED_POST_EVENT_TO_DOWN, data);
            });
        }
        
        function broadcastPostEvent(eventType, post) {
            $rootScope.$broadcast(eventType, post);
        }

        (function main() {
            loadEvents();
            getFollowingInstitutions();
            registerPostEvents();
        })();
    });
})();