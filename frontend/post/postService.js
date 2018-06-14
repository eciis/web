'use strict';

(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService(HttpService, AuthService) {
        var service = this;
        var POSTS_URI = "/api/posts";
        var LIMIT = 10;
        service.posts = [];
        service.user = AuthService.getCurrentUser();

        service.get = function getPosts() {
            return HttpService.get("/api/user/timeline");
        };

        service.getNextPosts = function getNextPosts(page) {
            var promise = HttpService.get("/api/user/timeline?page=" + page + "&limit=" + LIMIT);
            promise.then(function success(response) {
                service.posts = response;
            });
            return promise;
        };

        service.createPost = function createPost(post) {
            var institutionName = service.user.current_institution ? service.user.current_institution.name : "";
            var body = {
                post: post,
                currentInstitution: {
                    name: institutionName
                }
            };
            return HttpService.post(POSTS_URI, body);
        };

        service.likePost = function likePost(post) {
            var body = {
                currentInstitution: {
                    name: service.user.current_institution.name 
                }
            };
            return HttpService.post(`${POSTS_URI}/${post.key}/likes`, body);
        };

        service.dislikePost = function dislikePost(post) {
            return HttpService.delete(POSTS_URI + '/' + post.key + '/likes');
        };

        service.deletePost = function deletePost(post) {
            return HttpService.delete(POSTS_URI + '/' + post.key);
        };

        service.getLikes = function getLikes(likesURL) {
            return HttpService.get(likesURL);
        };

        service.save = function save(post_key, patch) {
            return HttpService.patch(POSTS_URI + '/' + post_key, patch);
        };

        service.getPost = function getPost(postKey) {
            return HttpService.get(POSTS_URI + '/' + postKey);
        };

        service.addSubscriber = function addSubscriber(postKey) {
            return HttpService.post(POSTS_URI + '/' + postKey + '/subscribers');
        };

        service.removeSubscriber = function removeSubscriber(postKey) {
            return HttpService.delete(POSTS_URI + '/' + postKey + '/subscribers');
        };
    });
})();