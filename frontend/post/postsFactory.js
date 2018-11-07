'use strict';
(function () {
    const app = angular.module("app");

    app.factory('PostsFactory', ($q, HttpService) => {
        
        /**
         * Posts constructor
         * @param {string} uri : The endpoint responsible for provide the
         * posts according to the timeline's type.
         * @param {list} data : A posts' array. Useful to start the posts with some
         * data.
         */
        function Posts(uri, data) {
            this.data = data || [];
            this.uri = uri;
            this.currentPage = 0;
            this.limit = 10;
            this.morePosts = true;
        }

        /**
         * It checks if the post has any activity, if so, it can't be removed, only update.
         * Otherwise, the post is removed from the array.
         * @param {Object} post : The post to be removed. 
         */
        Posts.prototype.removePost = function removePost(post) {
            post = new Post(post);

            if (!post.hasActivity()) {
                _.remove(this.data, (currentPost) => {
                    return currentPost.key === post.key;
                });
            } else {
                /**If there is any activity in the post
                 * it can not be removed, according to the clients
                 * specification, but need to be update to hide it's content.
                 */
                this.updatePost(post);
            }
        };

        /**
         * This function iterates over the posts' array to find a post
         * whose key is the same as the post argument and update it
         * to the new post, received as parameter.
         * @param {Post} post : the post to be updated 
         */
        Posts.prototype.updatePost = function updatePost(post) {
            const postIndex = _.findIndex(this.data, { 'key': post.key });
            if(postIndex > -1)
                this.data[postIndex] = post;
        };

        /**
         * It instantiate a new Post with the properties set
         * as the same as the parameter post's one.
         * @param {Object} post : The post to be added
         */
        Posts.prototype.addPost = function addPost(post) {
            this.data.push(new Post(post));
        };

        /**
         * Retrieves the posts from the currentPage
         * Returns: A promise returned by the HttpService that
         * stores the posts as result.
         */
        Posts.prototype.getNextPosts = function getNextPosts() {
            return HttpService.get(
                `${this.uri}/timeline?page=${this.currentPage}&limit=${this.limit}`
            );
        };

        /**
         * Returns the size of the posts' array
         */
        Posts.prototype.size = function size() {
            return this.data.length;
        };

        /**
         * It retrieves the posts from the currentPage,
         * increments the currentPage, set morePosts according to
         * the result and add each post to the posts' array.
         * Returns: A promise to allow its clients to act after the
         * posts' retrieval
         */
        Posts.prototype.loadMorePosts = function loadMorePosts(){
            const posts = this;
            let deffered = $q.defer();

            if (posts.morePosts) {
                posts.getNextPosts()
                .then(function success(response) {
                    posts.currentPage += 1;
                    posts.morePosts = response.next;

                    _.forEach(response.posts, function (post) {
                        posts.addPost(post);
                    });
                    deffered.resolve(response);
                });   
            } else {
                deffered.resolve();
            }
            
            return deffered.promise;
        };

        /**
         * The TimelinePosts constructor 
         * @param {list} data : A posts' array. Useful to start the posts with some
         * data.
         */
        function TimelinePosts(data) {
            Posts.call(this, '/api/user', data);
        }

        TimelinePosts.prototype = Object.create(Posts.prototype);

        /**
         * InstitutionTimeLinePosts constructor
         * @param {string} institutionKey : the key used to identify the institution
         * in the uri to reach the correct endpoint.
         * @param {list} data : A posts' array. Useful to start the posts with some
         * data.
         */
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