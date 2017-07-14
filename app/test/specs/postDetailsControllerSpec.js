'use strict';

describe('Test postDetailsController', function() {
    beforeEach(module('app'));

    var postDetailsCtrl, scope, httpBackend, rootScope, mdDialog, postService, mdToast, http, commentService, state, posts;
    var user = {
        name: 'name'
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
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = $http;
        state = $state;
        commentService = CommentService;
        posts = [
            {
                    title: 'post principal', author_key: user.key, institution: institutions[0],
                    key: "123456", comments: "/api/posts/123456/comments",
                    likes: "/api/posts/123456/likes", number_of_likes: 0, number_of_comments: 0
            },
            {title: 'post secundário', author_key: "", institution: institutions[0], key: "123412356"},
            {title: 'post', author: user, institution: institutions[0], key: "123454356", number_of_likes: 1}
        ];
        httpBackend.expectGET('/api/user').respond(user);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        postDetailsCtrl = $controller('PostDetailsController', {scope: scope});
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

   describe('deletePost()', function(){
        it('Should delete the post', function() {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(postService, 'deletePost').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            var post = posts[0];
            postDetailsCtrl.deletePost("$event", post, posts);
            httpBackend.flush();
            expect(posts.length).toBe(2);
            expect(postService.deletePost).toHaveBeenCalledWith(post);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('getLikes()', function() {
        it('Should get the likes', function() {
            spyOn(postService, 'getLikes').and.callThrough();
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.getLikes(posts[0]).then(function() {
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
           retorno = postDetailsCtrl.isAuthorized(posts[0]);
           expect(retorno).toEqual(true);
        });

        it('Should return false', function() {
            retorno = postDetailsCtrl.isAuthorized(posts[1]);
            expect(retorno).toEqual(false);
        });
    });

    describe('likeOrDislikePost()', function() {
        it('Should like the post', function() {
            spyOn(postDetailsCtrl, 'isLikedByUser').and.callThrough();
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            spyOn(postService, 'likePost').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.user.liked_posts = [];
            postDetailsCtrl.likeOrDislikePost(posts[0]).then(function() {
                expect(posts[0].number_of_likes).toEqual(1);
            });
            httpBackend.flush();
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith(posts[0]);
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postService.likePost).toHaveBeenCalledWith(posts[0]);
        });

        it('Should dislike the post', function() {
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
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith(posts[0]);
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postService.dislikePost).toHaveBeenCalledWith(posts[0]);
        });
    });

    describe('goToInstitution()', function() {
        it('Should call state.go', function() {
            spyOn(state, 'go').and.callThrough();
            postDetailsCtrl.goToInstitution(institutions[0]);
            expect(state.go).toHaveBeenCalled();
        });
    });

    describe('getComments()', function() {
        it('Should get the comments', function() {
            spyOn(commentService, 'getComments').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/comments').respond();
            postDetailsCtrl.getComments(posts[0]).then(function() {
                expect(posts[0].number_of_comments).toEqual(0);
            });
            httpBackend.flush();
            expect(commentService.getComments).toHaveBeenCalled();
        });
    });

    describe('showLikes()', function() {
        it('Should call getLikes and set currentPost to null', function() {
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            postDetailsCtrl.showLikes(posts[0]);
            httpBackend.flush();
            expect(postDetailsCtrl.currentPost).toEqual(posts[0].key);
            expect(postDetailsCtrl.getLikes).toHaveBeenCalled();
        });
    });

    describe('checkCurrentPost()', function() {
        it('Should return false', function() {
            var result = postDetailsCtrl.checkCurrentPost(posts[1].key);
            expect(result).toBeFalsy();
        });
    });

    describe('createComment()', function() {
        it('Should create a comment', function() {
           spyOn(commentService, 'createComment').and.callThrough();
           httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/comments').respond();
           postDetailsCtrl.comments = {};
           postDetailsCtrl.comments[posts[0].key] = {newComment: "teste", data: []};
           postDetailsCtrl.createComment(posts[0]).then(function() {
                expect(posts[0].number_of_comments).toEqual(1);
                expect(postDetailsCtrl.comments[posts[0].key].newComment).toEqual("");
           });
           httpBackend.flush();
           expect(commentService.createComment).toHaveBeenCalledWith(posts[0].key, "teste", posts[0].institution.key);
      });

        it('Should not create a comment', function() {
           spyOn(commentService, 'createComment').and.callThrough();
           postDetailsCtrl.comments = {};
           postDetailsCtrl.comments[posts[0].key] = {newComment: "", data: []};
           postDetailsCtrl.createComment(posts[0]);
           expect(commentService.createComment).not.toHaveBeenCalled();
        });
    });

    describe('canDeleteComment()', function() {
        it('Should return true', function() {
            var comment = {author_key: postDetailsCtrl.user.key, text: "testando"};
            var result = postDetailsCtrl.canDeleteComment(comment);
            expect(result).toBeTruthy();
        });

        it('Should return false', function() {
            var comment = {author_key: "1234", text: "testando"};
            var result = postDetailsCtrl.canDeleteComment(comment);
            expect(result).toBeFalsy();
        });
    });

    describe('deleteComment()', function(){
        it('Should delete the comment', function() {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(commentService, 'deleteComment').and.callThrough();
            postDetailsCtrl.comments = {};
            postDetailsCtrl.comments[posts[0].key] ={data: [{author_key: "1234", text: "testando", id:5}]};
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/comments/' + "5").respond({author_key: "1234", text: "testando", id:5});
            postDetailsCtrl.deleteComment("$event", posts[0], {author_key: "1234", text: "testando", id:5});
            httpBackend.flush();
            expect(commentService.deleteComment).toHaveBeenCalledWith(posts[0].key, 5);
            expect(postDetailsCtrl.comments[posts[0].key].data).toEqual([]);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('recognizeUrl()', function() {
        var post;

        beforeEach(function() {
           post = {
                title: 'Post de Tiago em www.twitter.com',
                text: 'Acessem: www.google.com',
                institutionKey: '54321'
            };
        });

        it('Should returns a post with https url in title', function() {
            var newPost = postDetailsCtrl.recognizeUrl(post);
            expect(newPost.title).toEqual("Post de Tiago em <a href='https://www.twitter.com' target='_blank'>https://www.twitter.com</a>");
        });

        it('Should not change the original post title', function() {
            var newPost = postDetailsCtrl.recognizeUrl(post);
            expect(post.title).toEqual("Post de Tiago em www.twitter.com");
        });

        it('Should returns a post with https url in text', function() {
            var newPost = postDetailsCtrl.recognizeUrl(post);
            expect(newPost.text).toEqual("Acessem: <a href='https://www.google.com' target='_blank'>https://www.google.com</a>");
        });

        it('Should not change the original post text', function() {
            var newPost = postDetailsCtrl.recognizeUrl(post);
            expect(post.text).toEqual("Acessem: www.google.com");
        });
    });

});