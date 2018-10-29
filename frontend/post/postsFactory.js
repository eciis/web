'use strict';
(function () {
    const app = angular.module("app");

    app.factory('PostsFactory', ($q, HttpService) => {
        
        function Posts(uri, data) {
            this.data = data || [];
            this.uri = uri;
            this.currentPage = 0;
            this.limit = 10;
            this.morePosts = true;
        }

        Posts.prototype.removePost = function removePost(post) {
            post = new Post(post);

            if (!post.hasActivity()) {
                _.remove(this.data, (currentPost) => {
                    return currentPost.key === post.key;
                });
            } else {
                const postIndex = _.findIndex(timelineCtrl.posts, { 'key': post.key });
                this.data[postIndex] = post;
            }
        };

        Posts.prototype.addPost = function addPost(post) {
            this.data.push(post);
        };

        Posts.prototype.getNextPosts = function getNextPosts() {
            return HttpService.get(
                `${this.uri}/timeline?page=${this.currentPage}&limit=${this.limit}`
            );
        };

        Posts.prototype.size = function size() {
            return this.data.length;
        };

        Posts.prototype.loadMorePosts = function loadMorePosts(){
            var deferred = $q.defer();
            const posts = this;
            
            if (posts.morePosts) {
                posts.getNextPosts().then(function success(response) {
                    posts.currentPage += 1;
                    posts.morePosts = response.next;

                    _.forEach(response.posts, function (post) {
                        posts.addPost(post);
                    });

                    deferred.resolve();
                }, function error() {
                    deferred.reject();
                });
            } else {
                deferred.resolve();
            }
            
            return deferred.promise;
        };

        function TimelinePosts(data) {
            Posts.call(this, '/api/user', data);
        }

        TimelinePosts.prototype = Object.create(Posts.prototype);

        function InstitutionTimelinePosts(institutionKey, data) {
            Posts.call(this, `/api/institutions/${institutionKey}`, data);
        }

        InstitutionTimelinePosts.prototype = Object.create(Posts.prototype);

        return {
            posts: Posts,
            timelinePosts: TimelinePosts,
            institutionTimelinePosts: InstitutionTimelinePosts
        };
    });
})();