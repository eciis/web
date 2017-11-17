(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService) {
        var timelineCtrl = this;
        var content = document.getElementById("content");

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