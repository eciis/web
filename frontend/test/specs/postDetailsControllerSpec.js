'use strict';

(describe('Test postDetailsController', function() {
    beforeEach(module('app'));

    var postDetailsCtrl, scope, httpBackend, rootScope, mdDialog, postService, mdToast, http,
    commentService, state, posts, rootscope;
    var user = {
        name: 'name',
        key: 'asd234jk2l',
        state: 'active'
    };

    var institutions = [
            {name: 'Splab',key: '098745', followers: [user], members: [user], admin: user},
            {name: 'e-CIS', key: '456879', followers: [user], members: [user]}
        ];

    user.current_institution = institutions[0];
    var POSTS_URI = "/api/posts";


    beforeEach(inject(function($controller, $httpBackend, $http, $mdDialog,
            PostService, AuthService, $mdToast, $rootScope, CommentService, $state) {
        scope = $rootScope.$new();
        rootscope = $rootScope;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = $http;
        state = $state;
        commentService = CommentService;
        var mainPost = new Post({
                    title: 'main post', author_key: user.key, institution_key: institutions[0].key,
                    key: "123456", comments: "/api/posts/123456/comments",
                    likes: "/api/posts/123456/likes", number_of_likes: 0, number_of_comments: 0
        });
        var secondaryPost = new Post({title: 'secondary post', author_key: "", institution: institutions[0], key: "123412356"});
        var otherPost = new Post({title: 'other post', author: user, institution: institutions[0], key: "123454356", number_of_likes: 1, number_of_comments: 1});
        posts = [mainPost, secondaryPost, otherPost];
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);

        AuthService.getCurrentUser = function() {
            return new User(user);
        };

        postDetailsCtrl = $controller('PostDetailsController',{
            scope: scope,
            $rootScope: rootscope,
            $scope: scope
        });
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

   describe('deletePost()', function(){
        beforeEach(function() {
            postDetailsCtrl.post = posts[0];
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(postService, 'deletePost').and.callThrough();
        });

        it('Should delete the post when it has activity', function() {
            postDetailsCtrl.post.number_of_likes = 1;
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            postDetailsCtrl.deletePost("$event");
            httpBackend.flush();
            expect(postDetailsCtrl.post.state).toBe("deleted");
            expect(postService.deletePost).toHaveBeenCalledWith(postDetailsCtrl.post);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it('Should remove the post when it has no activity', function() {
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            postDetailsCtrl.deletePost("$event");
            httpBackend.flush();
            expect(postDetailsCtrl.post.state).toBe("deleted");
            expect(postService.deletePost).toHaveBeenCalledWith(postDetailsCtrl.post);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('getLikes()', function() {
        it('Should get the likes', function() {
            spyOn(postService, 'getLikes').and.callThrough();
            postDetailsCtrl.post = posts[0];
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.getLikes().then(function() {
                expect(posts[0].number_of_likes).toEqual(0);
                expect(posts[1].number_of_likes).toEqual(undefined);
            });
            httpBackend.flush();
            expect(postService.getLikes).toHaveBeenCalled();
        });
    });

    describe('isAuthorized()', function() {

        var retorno;
        it('Should return true', function() {
           postDetailsCtrl.post = posts[0];
           retorno = postDetailsCtrl.isAuthorized();
           expect(retorno).toEqual(true);
        });

        it('Should return false', function() {
            postDetailsCtrl.post = posts[1];
            retorno = postDetailsCtrl.isAuthorized();
            expect(retorno).toEqual(false);
        });
    });

    describe('likeOrDislikePost()', function() {
        it('Should like the post', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(postDetailsCtrl, 'isLikedByUser').and.callThrough();
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            spyOn(postService, 'likePost').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.user.liked_posts = [];
            expect(postDetailsCtrl.showLikes).toEqual(false);
            postDetailsCtrl.likeOrDislikePost(posts[0]).then(function() {
                expect(posts[0].number_of_likes).toEqual(1);
            });
            httpBackend.flush();
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith();
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postDetailsCtrl.showLikes).toEqual(true);
            expect(postService.likePost).toHaveBeenCalledWith(posts[0]);
        });

        it('Should dislike the post', function() {
            postDetailsCtrl.post = posts[0];
            postDetailsCtrl.user.liked_posts = [posts[0].key];
            posts[0].number_of_likes = 1;
            spyOn(postDetailsCtrl, 'isLikedByUser').and.callThrough();
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            spyOn(postService, 'dislikePost').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            postDetailsCtrl.likeOrDislikePost(posts[0]).then(function() {
                expect(posts[0].number_of_likes).toEqual(0);
            });
            httpBackend.flush();
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith();
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postService.dislikePost).toHaveBeenCalledWith(posts[0]);
        });
    });

    describe('goToInstitution()', function() {
        it('Should call state.go', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(state, 'go').and.callThrough();

            httpBackend.when('GET', 'institution/institution_page.html').respond(200);

            postDetailsCtrl.goToInstitution(institutions[0].key);

            expect(state.go).toHaveBeenCalledWith('app.institution.timeline', Object({ institutionKey: institutions[0].key }));
        });
    });

    describe('getComments()', function() {
        it('Should get the comments', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(commentService, 'getComments').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/comments').respond();
            postDetailsCtrl.getComments().then(function() {
                expect(posts[0].number_of_comments).toEqual(0);
            });
            httpBackend.flush();
            expect(commentService.getComments).toHaveBeenCalled();
        });
    });

    describe('createComment()', function() {
        it('Should create a comment', function() {
           postDetailsCtrl.post = posts[0];
           postDetailsCtrl.post.data_comments = [];
           spyOn(commentService, 'createComment').and.callThrough();
           httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/comments').respond({
            "text": "comment",
            "id": "123klsdf124"
           });
           postDetailsCtrl.post.data_comments = [];
           postDetailsCtrl.newComment = "teste";
           postDetailsCtrl.createComment().then(function() {
                expect(posts[0].number_of_comments).toEqual(1);
                expect(postDetailsCtrl.newComment).toEqual("");
           });
           httpBackend.flush();
           expect(commentService.createComment).toHaveBeenCalledWith(postDetailsCtrl.post.key, "teste", posts[0].institution_key);
      });

        it('Should not create a comment', function() {
           postDetailsCtrl.post = posts[0];
           spyOn(commentService, 'createComment').and.callThrough();
           postDetailsCtrl.comments = {};
           postDetailsCtrl.newComment = "";
           postDetailsCtrl.createComment();
           expect(commentService.createComment).not.toHaveBeenCalled();
        });
    });

    describe('postToUrl()', function() {
        var post;

        beforeEach(function() {
           post = {
                title: 'Post de Tiago em www.twitter.com',
                text: 'Acessem: www.google.com',
                institutionKey: '54321'
            };
        });

        it('Should not change the original post title', function() {
            postDetailsCtrl.postToURL(post);
            expect(post.title).toEqual("Post de Tiago em www.twitter.com");
        });

        it('Should returns a post with https url in text', function() {
            var newPost = postDetailsCtrl.postToURL(post);
            expect(newPost.text).toEqual("Acessem: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
        });

        it('Should not change the original post text', function() {
            postDetailsCtrl.postToURL(post);
            expect(post.text).toEqual("Acessem: www.google.com");
        });
    });

    describe('isLongPostTimeline()', function() {
        var post;
        var long_post;

        beforeEach(function() {
            post = {
                title: 'Post de Tiago em www.twitter.com',
                text: 'Acessem: www.google.com',
                institutionKey: '54321'
            };

            long_post = {
                title: "Post muito longo",
                text: "Acessem: www.google.com aAt vero et accusamus et iusto odio dignis\
                    simos ducimus quiblanditiis praesentium voluptatum deleniti atque corr\
                    pti quos dolores et quas molestias excepturi sint occaecati cupiditate\
                    non provident, similique sunt in culpa qui officia deserunt mollitia \
                    animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis e\
                    et expedita distinctio. Nam libero tempore, cum soluta nobis est elige\
                    ndi optio cumque nihil impedit quo minus id quod maxime placeat facere\
                    possimus, omnis voluptas assumenda est, omnis dolor repellendus. \
                    Temporibus autem quibusdam et aut officiis debitis aut rerum necessit\
                    atibus saepe eveniet ut et voluptates repudiandae sint et molestiae \
                    non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, \
                    ut aut reiciendis voluptatibus Acessem: www.google.com.",
                institutionKey: '54321'
            };
        });

        it('Should be true', function() {
            expect(postDetailsCtrl.isLongPostTimeline(long_post.text)).toBe(true);
        });

        it('Should be false', function() {
            expect(postDetailsCtrl.isLongPostTimeline(post.text)).toBe(false);
        });
    });

    describe('showImage()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.photo_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return True when the post has a photo_url', function() {
            expect(postDetailsCtrl.showImage(post)).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            post.state = "deleted";
            expect(postDetailsCtrl.showImage(post)).toBe(false);
        });

        it('should return false when the post does not have a photo_url', function() {
            post.photo_url = null;
            expect(postDetailsCtrl.showImage(post)).toBe(false);
            post.photo_url = "";
            expect(postDetailsCtrl.showImage(post)).toBe(false);
            post.photo_url = undefined;
            expect(postDetailsCtrl.showImage(post)).toBe(false);
        });
    });

    describe('showVideo()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return True when the post has a video_url', function() {
            expect(postDetailsCtrl.showVideo(post)).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            post.state = "deleted";
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
        });

        it('should return false when the post does not have a video_url', function() {
            post.video_url = null;
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
            post.video_url = "";
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
            post.video_url = undefined;
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
        });
    });

    describe('getVideoUrl()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return undefined', function() {
            post.video_url = undefined;
            expect(postDetailsCtrl.getVideoUrl(post)).toBe(undefined);
        });

        it('should return the embed Youtube url', function() {
            post.video_url = 'https://www.youtube.com/watch?v=3T3g8rV-5GU';
            expect(postDetailsCtrl.getVideoUrl(post)).toBe('https://www.youtube.com/embed/3T3g8rV-5GU');
        });
    });

    describe('subscribe()', function() {

        var post;

        beforeEach(function() {
            post = posts[0];
            post.subscribers = [user.key];
            postDetailsCtrl.post = post;
        });

        it('should call addSubscriber', function() {
            spyOn(postService, 'addSubscriber').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            postDetailsCtrl.addSubscriber();
            expect(postService.addSubscriber).toHaveBeenCalled();
        });

        it('should call removeSubscriber', function() {
            spyOn(postService, 'removeSubscriber').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            postDetailsCtrl.removeSubscriber();
            expect(postService.removeSubscriber).toHaveBeenCalled();
        });

        it('should return true', function() {
            var result = postDetailsCtrl.isSubscriber();
            expect(result).toBe(true);
        });
    });

    describe('number_of_likes()', function() {

        beforeEach(function() {
            postDetailsCtrl.post = posts[2];
        });

        it('Should return the number of likes if number_of_likes are < 100', function() {
            postDetailsCtrl.post.number_of_likes = 50;
            expect(postDetailsCtrl.number_of_likes()).toEqual(50);
        });

        it('Should return the string "+99" if number_of_likes are > 99', function() {
            postDetailsCtrl.post.number_of_likes = 150;
            expect(postDetailsCtrl.number_of_likes()).toEqual("+99");
        });
    });

    describe('number_of_comments()', function() {
        beforeEach(function() {
            postDetailsCtrl.post = posts[2];
        });

        it('Should return the number of comments if number_of_comments are < 100', function() {
            postDetailsCtrl.post.number_of_comments = 50;
            expect(postDetailsCtrl.number_of_comments()).toEqual(50);
        });

        it('Should return the string "+99" if number_of_comments are > 99', function() {
            postDetailsCtrl.post.number_of_comments = 150;
            expect(postDetailsCtrl.number_of_comments()).toEqual("+99");
        });
    });
}));