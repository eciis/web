(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService) {
        var timelineCtrl = this;
        var content = document.getElementById("content");

        timelineCtrl.user = AuthService.getCurrentUser();
        timelineCtrl.refreshTimeline = false;
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

        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
           return timelineCtrl.refreshTimeline;
        };

        timelineCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            timelineCtrl.refreshTimeline = !timelineCtrl.refreshTimeline;
        };

        timelineCtrl.load = function load() {
            var reload = true;
            timelineCtrl.loadMorePosts(reload).then(function success() {
                timelineCtrl.setRefreshTimelineButton();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        };

        (function main() {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.setRefreshTimelineButton);
        })();
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