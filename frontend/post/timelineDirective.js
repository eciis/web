(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, $rootScope) {
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
            var post = new Post(post);
            if (!post.hasActivity()) {
                _.remove(timelineCtrl.posts, function (currentPost) {
                    return currentPost.key === post.key;
                });
            } else {
                var postIndex = _.findIndex(timelineCtrl.posts, {'key': post.key});
                timelineCtrl.posts[postIndex] = post;
            }
        }

        function eventListener() {
            $rootScope.$on(DELETED_POST_EVENT, function (post) {
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