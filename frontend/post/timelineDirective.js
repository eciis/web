(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('TimelineController', function(AuthService, MessageService, NotificationService, PostService) {
        var timelineCtrl = this;
        var content = document.getElementById("content");
        var alreadyRequested = false;

        content.onscroll = function onscroll() {
            var screenPosition = content.scrollTop + content.offsetHeight;
            var maxHeight = content.scrollHeight;
            var quant = screenPosition/maxHeight;

            if (quant >= 0.75 && !alreadyRequested) {
                alreadyRequested = true;

                PostService.getNextPosts().then(function success(response) {
                    alreadyRequested = false;

                    _.forEach(response.data, function(post) {
                        timelineCtrl.posts.push(post);
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        alreadyRequested = false;
                    });
                });
            }
        };

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
            templateUrl: "app/post/timeline.html",
            controller: "TimelineController",
            controllerAs: "timelineCtrl",
            scope: {
                institution: '=',
                user: '=',
                addPost: '='
            },
            bindToController: {
                posts: '='
            }
        };
    });
})();