'use strict';

(function () {
    const app = angular.module("app");

    app.controller("SharePostController", function SharePostController(user, posts, post, addPost, $mdDialog, PostService,
        MessageService, $state) {
        var shareCtrl = this;

        var LIMIT_POST_CHARACTERS = 15;
        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";

        shareCtrl.user = user;

        shareCtrl.post = new Post(post, post.institution_key);

        shareCtrl.posts = posts;
        shareCtrl.addPost = addPost;
        shareCtrl.newPost = new Post({}, shareCtrl.user.current_institution.key);

        shareCtrl.cancelDialog = function cancelDialog() {
            $mdDialog.cancel();
        };

        shareCtrl.showImage = function showImage() {
            var postObj = new Post(shareCtrl.post);
            return postObj.hasImage() && !postObj.isDeleted();
        };

        shareCtrl.showVideo = function showVideo() {
            var postObj = new Post(shareCtrl.post);
            return postObj.hasVideo() && !postObj.isDeleted();
        };

        shareCtrl.getVideoUrl = function getVideoUrl() {
            var postObj = new Post(shareCtrl.post);
            return postObj.getVideoUrl();
        };

        shareCtrl.isSurvey = function isSurvey() {
            return shareCtrl.post.type_survey;
        };

        shareCtrl.share = function share() {
            makePost(shareCtrl.post);
            PostService.createPost(shareCtrl.newPost).then(function success(response) {
                MessageService.showToast('Compartilhado com sucesso!');
                $mdDialog.hide();
                shareCtrl.addPostTimeline(response.data);
            }, function error(response) {
                $mdDialog.hide();
                MessageService.showToast(response.data.msg);
            });
        };

        shareCtrl.addPostTimeline = function addPostTimeline(post) {
            if (shareCtrl.addPost) {
                shareCtrl.posts.push(post);
            }
        };

        shareCtrl.isEvent = function isEvent() {
            var hasLocal = !_.isUndefined(shareCtrl.post.local);
            var hasStartTime = !_.isUndefined(shareCtrl.post.start_time);
            var hasEndTime = !_.isUndefined(shareCtrl.post.end_time);
            return hasLocal && hasStartTime && hasEndTime;
        };

        shareCtrl.goTo = function goTo() {
            shareCtrl.cancelDialog();
            if (shareCtrl.isEvent()) {
                $state.go('app.user.event', { eventKey: shareCtrl.post.key, posts: shareCtrl.posts });
            }
            $state.go('app.post', { postKey: shareCtrl.post.key });
        };

        shareCtrl.showPdfFiles = function showPdfFiles() {
            return !_.isEmpty(shareCtrl.post.pdf_files);
        };

        function makePost(post) {
            if (shareCtrl.isEvent()) {
                shareCtrl.newPost.shared_event = post.key;
            } else {
                shareCtrl.newPost.shared_post = post.key;
            }
            shareCtrl.newPost.pdf_files = [];
        }

        shareCtrl.postToURL = function postToURL(text) {
            if (text) {
                text = Utils.limitString(text, LIMIT_POST_CHARACTERS);
            }
            return text && text.replace(URL_PATTERN, REPLACE_URL);
        };
    });
})();