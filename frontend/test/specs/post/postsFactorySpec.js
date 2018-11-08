'use strict';

(describe('Test PostsFactory', function () {
    beforeEach(module('app'));

    let postsFactory, httpService;

    let post = {
        title: 'post principal',
        institution_key: "institution_key",
        key: "123456912839010",
        state: 'published'
    };

    let post_with_activity = {
        title: 'post principal',
        institution_key: "institution_key",
        key: "123456",
        state: 'published',
        comments: "/api/posts/123456/comments",
        number_of_comments: 1
    };

    beforeEach(inject(function (PostsFactory, HttpService) {
        postsFactory = PostsFactory;
        httpService = HttpService;
    }));

    describe("verify posts' initial properties as soon as its instantiation", () => {
        it('should have uri equals to /api/user', () => {
            const posts = new postsFactory.timelinePosts();
            expect(posts.uri).toEqual('/api/user');
        });

        it('should have uri equals to /api/institutions/institutionKey', () => {
            const posts = new postsFactory.institutionTimelinePosts('institutionKey');
            expect(posts.uri).toEqual('/api/institutions/institutionKey');
        });

        it('should have the initial properties as the expected ones', () => {
            const posts = new postsFactory.posts();
            expect(posts.data).toEqual([]);
            expect(posts.currentPage).toEqual(0);
            expect(posts.limit).toEqual(10);
            expect(posts.morePosts).toEqual(true);
        });
    });

    describe('removePost()', () => {
        it('should remove the post', () => {
            const posts = new postsFactory.posts();
            posts.data = [post_with_activity, post];
            posts.removePost(post);
            expect(posts.data).toEqual([post_with_activity]);
        });

        it('should not remove the post because it has activity', () => {
            const posts = new postsFactory.posts();
            posts.data = [post_with_activity, post];
            posts.removePost(post_with_activity);
            expect(posts.data).toEqual([new Post(post_with_activity), post]);
        });
    });

    describe('addPost()', () => {
        it('should add the post', () => {
            const posts = new postsFactory.posts();
            expect(posts.data).toEqual([]);
            posts.addPost(post);
            expect(posts.data).toEqual([new Post(post)]);
        });
    });

    describe('getNextPosts()', () => {
        it('should call httpService.get', () => {
            spyOn(httpService, 'get').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });

            const posts = new postsFactory.posts('/api/mock');
            posts.getNextPosts();

            expect(httpService.get).toHaveBeenCalledWith('/api/mock/timeline?page=0&limit=10');
        });
    });

    describe('size()', () => {
        it('should return the data.length', () => {
            const posts = new postsFactory.posts('', [post, post_with_activity]);
            expect(posts.size()).toEqual(2);
        });
    });

    describe('loadMorePosts()', () => {
        it('should call getNextPosts', () => {
            const posts = new postsFactory.posts();

            spyOn(posts, 'getNextPosts').and.callFake(() => {
                return {
                    then: function(callback) {
                        const data = {
                            posts: [post, post_with_activity],
                            next: true
                        };
                        return callback(data);
                    }
                }
            });

            expect(posts.data).toEqual([]);

            posts.loadMorePosts();

            expect(posts.getNextPosts).toHaveBeenCalled();
            expect(posts.currentPage).toEqual(1);
            expect(posts.morePosts).toEqual(true);
            expect(posts.data).toEqual([new Post(post), new Post(post_with_activity)])
        });

        it('should not call getNextPosts when morePosts is false', () => {
            const posts = new postsFactory.posts();
            posts.morePosts = false;

            spyOn(posts, 'getNextPosts');

            expect(posts.data).toEqual([]);

            posts.loadMorePosts();

            expect(posts.getNextPosts).not.toHaveBeenCalled();
            expect(posts.currentPage).toEqual(0);
            expect(posts.morePosts).toEqual(false);
            expect(posts.data).toEqual([])
        });
    });
}));