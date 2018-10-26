(function () {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function (AuthService, $rootScope,
        NotificationService, PostsFactory) {
        const timelineCtrl = this;
        const content = document.getElementById("content");

        const DELETED_POST_EVENT = 'DELETED_POST';
        const NEW_POST_EVENT = 'NEW_POST';

        timelineCtrl.hasPostFromCurrentInstitution = false;
        timelineCtrl.user = AuthService.getCurrentUser();
        timelineCtrl.isLoadingPosts = false;
        timelineCtrl.refreshTimeline = false;

        timelineCtrl.addPost = (post) => {
            timelineCtrl.posts.addPost(post);
        };

        timelineCtrl.deletePost = (post) => {
            timelineCtrl.posts.removePost(post);
        };

        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
            return timelineCtrl.refreshTimeline;
        };

        timelineCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            timelineCtrl.refreshTimeline = !timelineCtrl.refreshTimeline;
        };

        function loadPosts() {
            var promise = timelineCtrl.posts.loadMorePosts();

            promise.then(function success() {
                timelineCtrl.isLoadingPosts = false;
            });

            return promise;
        }

        function startEventsListeners() {
            $rootScope.$on(DELETED_POST_EVENT, function (event, post) {
                timelineCtrl.deletePost(post);
            });

            $rootScope.$on(NEW_POST_EVENT, (event, post) => {
                timelineCtrl.addPost(post);
            });
        }

        function getPosts() {
            timelineCtrl.posts = new PostsFactory.timelinePosts();
            timelineCtrl.isLoadingPosts = true;
            loadPosts();
        }

        Utils.setScrollListener(content, loadPosts);

        (() => {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.setRefreshTimelineButton);
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