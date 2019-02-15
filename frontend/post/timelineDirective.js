(function () {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function (AuthService, $rootScope,
        NotificationService, PostsFactory, $scope, POST_EVENTS) {
        const timelineCtrl = this;

        const institutionKey = $scope.institution;

        timelineCtrl.hasPostFromCurrentInstitution = false;
        timelineCtrl.user = AuthService.getCurrentUser();
        timelineCtrl.isLoadingPosts = false;
        timelineCtrl.refreshTimelineFlag = false;
        
        timelineCtrl.addPost = (post) => {
            timelineCtrl.posts.addPost(post);
        };

        timelineCtrl.deletePost = (post) => {
            timelineCtrl.posts.removePost(post);
        };

        /**
         * Just returns the flag that checks if the button responsible for 
         * refresh the timeline has to be shown.
         */
        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
            return timelineCtrl.refreshTimelineFlag;
        };

        /**
         * Changes the value of the refresh timeline flag.
         */
        timelineCtrl.toggleRefreshTimelineButton = function toggleRefreshTimelineButton() {
            timelineCtrl.refreshTimelineFlag = !timelineCtrl.refreshTimelineFlag;
        };

        /**
         * Get the posts and then change the value 
         * of the refresh timeline flag to hide the refresh button
         */
        timelineCtrl.refreshTimeline = () => {
            getPosts();
            timelineCtrl.toggleRefreshTimelineButton();
        };

        /**
         * Retrieve the posts by calling loadMorePosts
         * from posts object and set isLoadingPosts to
         * false to hide the loading icon.
         * @private
         */
        timelineCtrl._loadPosts = function loadPosts() {
            return timelineCtrl.posts.loadMorePosts();
        };

        timelineCtrl.isMobileScreen = () => Utils.isMobileScreen();

        /**
         * Set the properties necessary to make the default Timeline work
         * with the expected values to this context.
         */
        function setUpDefaultTimeline() {
            timelineCtrl.postsType = PostsFactory.timelinePosts;
            timelineCtrl.contentId = "content";
        }

        /**
         * Set the properties necessary to make the InstitutionTimeline work
         * with the expected values to this context.
         */
        function setUpInstitutionTimeline() {
            timelineCtrl.postsType = PostsFactory.institutionTimelinePosts;
            timelineCtrl.contentId = "instPage";
        }

        /**
         * Instantiate a new posts object, get the next posts
         * by calling _loadPosts and handle with the isLoadingPosts
         * flag.
         */
        function getPosts() {
            timelineCtrl.posts = new timelineCtrl.postsType(institutionKey);
            timelineCtrl.isLoadingPosts = true;
            timelineCtrl._loadPosts().then(() => {
                timelineCtrl.isLoadingPosts = false;
            });
        }

        /**
         * Wraps the initialization of the eventListeners.
         * Each listener do specific operations in the callback function.
         */
        function startEventsListeners() {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.toggleRefreshTimelineButton);

            $rootScope.$on(POST_EVENTS.DELETED_POST_EVENT_TO_DOWN, function (event, post) {
                timelineCtrl.deletePost(post);
            });

            $rootScope.$on(POST_EVENTS.NEW_POST_EVENT_TO_DOWN, (event, post) => {
                timelineCtrl.addPost(post);
            });

            const content = document.getElementById(timelineCtrl.contentId);
            Utils.setScrollListener(content, timelineCtrl._loadPosts);
        }

        /**
         * Wrap the calls that are necessary as soon as the controller
         * starts.
         */
        (() => {
            institutionKey && setUpInstitutionTimeline();
            !institutionKey && setUpDefaultTimeline();
            getPosts();
            startEventsListeners();
        })();
    });

    app.directive("postTimeline", function () {
        return {
            restrict: 'E',
            templateUrl: "app/post/timeline.html",
            controller: "TimelineController",
            controllerAs: "timelineCtrl",
            scope: {
                institution: '='
            }
        };
    });
})();