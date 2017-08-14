(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService, PostService) {
        var timelineCtrl = this;

        timelineCtrl.user = AuthService.getCurrentUser();

        timelineCtrl.refreshPostButton = false;

        timelineCtrl.showRefreshPostButton = function showRefreshPostButton() {
           return timelineCtrl.refreshPostButton;
        };

        timelineCtrl.setShowRefreshPostButton = function setShowRefreshPostButton() {
            timelineCtrl.refreshPostButton = !timelineCtrl.refreshPostButton;
        };

        timelineCtrl.load = function load(posts) {
            PostService.get().then(function success(response) {
                posts.splice(0, posts.length);
                _.forEach(response.data, function(post) {
                    posts.push(post);
                });
                timelineCtrl.setShowRefreshPostButton();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        };

        (function main() {
            NotificationService.watchPostNotification(timelineCtrl.user.key, timelineCtrl.setShowRefreshPostButton);
        })();
    });

    app.directive("timeline", function() {
        return {
            restrict: 'E',
            templateUrl: "post/timeline.html",
            controller: "TimelineController",
            controllerAs: "timelineCtrl",
            scope: {
                posts: '=',
                institution: '=',
                user: '='
            }
        };
    });
})();