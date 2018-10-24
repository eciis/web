(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, $rootScope, PostService, 
        $q, NotificationService) {
        var timelineCtrl = this;
        var content = document.getElementById("content");

        var DELETED_POST_EVENT = 'DELETED_POST';
        const NEW_POST_EVENT = 'NEW-POST';

        timelineCtrl.posts = [];
        timelineCtrl.user = AuthService.getCurrentUser();
        timelineCtrl.isLoadingPosts = false;
        timelineCtrl.refreshTimeline = false;

        let morePosts = true;
        let currentPage = 0;

        timelineCtrl.loadMorePosts = function loadMorePosts(reload) {
            var deferred = $q.defer();

            if (reload) {
                currentPage = 0;
                morePosts = true;
                timelineCtrl.posts.splice(0, timelineCtrl.posts.length);
                timelineCtrl.setRefreshTimelineButton();
                timelineCtrl.isLoadingPosts = true;
            }

            if (morePosts) {
                loadPosts(deferred);
            } else {
                deferred.resolve();
            }
 
            return deferred.promise;
        };

        timelineCtrl.addPost = (post) => {
            timelineCtrl.posts.push(post);
        };

        function loadPosts1() {
            timelineCtrl.isLoadingPosts = true;
            var promise = timelineCtrl.loadMorePosts();

            promise.then(function success() {
                timelineCtrl.isLoadingPosts = false;
            });

            return promise;
        }

        function loadPosts(deferred) {
            PostService.getNextPosts(currentPage).then(function success(response) {
                currentPage += 1;
                morePosts = response.next;

                _.forEach(response.posts, function (post) {
                    timelineCtrl.posts.push(post);
                });

                timelineCtrl.isLoadingPosts = false;
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
        }

        timelineCtrl.deletePost = (post) => {
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

        Utils.setScrollListener(content, loadPosts1);

        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
            return timelineCtrl.refreshTimeline;
        };

        timelineCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            timelineCtrl.refreshTimeline = !timelineCtrl.refreshTimeline;
        };

        function startEventsListeners() {
            $rootScope.$on(DELETED_POST_EVENT, function (event, post) {
                timelineCtrl.deletePost(post);
            });

            $rootScope.$on(NEW_POST_EVENT, (event, post) => {
                timelineCtrl.addPost(post);
            });
        }

        (() => {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.setRefreshTimelineButton);
            timelineCtrl.loadMorePosts();
            startEventsListeners();
        })();
    });

    app.directive("postTimeline", function() {
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