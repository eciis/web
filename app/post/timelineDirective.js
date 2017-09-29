(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService, PostService) {
        var timelineCtrl = this;

        timelineCtrl.user = AuthService.getCurrentUser();

        timelineCtrl.refreshTimeline = false;

        timelineCtrl.showRefreshTimelineButton = function showRefreshTimelineButton() {
           return timelineCtrl.refreshTimeline;
        };

        timelineCtrl.setRefreshTimelineButton = function setRefreshTimelineButton() {
            timelineCtrl.refreshTimeline = !timelineCtrl.refreshTimeline;
        };

        timelineCtrl.load = function load(posts) {
            PostService.get().then(function success(response) {
                posts.splice(0, posts.length);
                _.forEach(response.data, function(post) {
                    posts.push(post);
                });
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
            templateUrl: "post/timeline.html",
            controller: "TimelineController",
            controllerAs: "timelineCtrl",
            scope: {
                posts: '=',
                institution: '=',
                user: '=',
                addPost: '='
            }
        };
    });
})();