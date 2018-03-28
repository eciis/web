(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService, $rootScope) {
        var timelineCtrl = this;
        var content = document.getElementById("content");

        var DELETED_POST_EVENT = 'DELETED_POST';

        timelineCtrl.user = AuthService.getCurrentUser();
        timelineCtrl.isLoadingPosts = false;

        function loadMorePosts() {
            timelineCtrl.isLoadingPosts = true;
            var promise = timelineCtrl.loadMorePosts();

            promise.then(function success() {
                timelineCtrl.isLoadingPosts = false;
            });

            return promise;
        }

        function deletePost(post) {
            var post = _.find(timelineCtrl.posts, {'key': postKey});
            if (!post.hasActivity()) {
                _.remove(timelineCtrl.posts, function (currentPost) {
                    return currentPost.key === postKey;
                });
            }
        }

        function eventListener() {
            $rootScope.$on(DELETED_POST_EVENT, function (event, post) {
                deletePost(post);
            });
        }

        eventListener();

        Utils.setScrollListener(content, loadMorePosts);
    });

    app.directive("postTimeline", function() {
        return {
            restrict: 'E',
            templateUrl: "app/post/timeline.html",
            controller: "TimelineController",
            controllerAs: "timelineCtrl",
            scope: {
                institution: '=',
                user: '=',
                addPost: '='
            },
            bindToController: {
                posts: '=',
                loadMorePosts: '='
            }
        };
    });
})();