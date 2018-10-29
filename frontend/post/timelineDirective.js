(function () {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function (AuthService, $rootScope,
        NotificationService, PostsFactory, $scope) {
        const timelineCtrl = this;

        const DELETED_POST_EVENT = 'DELETED_POST';
        const NEW_POST_EVENT = 'NEW_POST';

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

        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
            return timelineCtrl.refreshTimelineFlag;
        };

        timelineCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            timelineCtrl.refreshTimelineFlag = !timelineCtrl.refreshTimelineFlag;
        };

        timelineCtrl.refreshTimeline = () => {
            getPosts();
            timelineCtrl.setRefreshTimelineButton();
        };

        function loadPosts() {
            var promise = timelineCtrl.posts.loadMorePosts();

            promise.then(function success() {
                timelineCtrl.isLoadingPosts = false;
            });

            return promise;
        }

        function setUpTimelineProperties() {
            if (institutionKey) {
                timelineCtrl.postsType = PostsFactory.institutionTimelinePosts;
                timelineCtrl.contentId = "instPage";
            } else {
                timelineCtrl.postsType = PostsFactory.timelinePosts;
                timelineCtrl.contentId = "content";
            }
        }

        function getPosts() {
            timelineCtrl.posts = new timelineCtrl.postsType(institutionKey);
            timelineCtrl.isLoadingPosts = true;
            loadPosts();
        }

        function startEventsListeners() {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.setRefreshTimelineButton);

            $rootScope.$on(DELETED_POST_EVENT, function (event, post) {
                timelineCtrl.deletePost(post);
            });

            $rootScope.$on(NEW_POST_EVENT, (event, post) => {
                timelineCtrl.addPost(post);
            });

            const content = document.getElementById(timelineCtrl.contentId);
            Utils.setScrollListener(content, loadPosts);
        }

        (() => {
            setUpTimelineProperties();
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