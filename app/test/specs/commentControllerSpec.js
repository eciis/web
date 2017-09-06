'use strict';

(describe('Test CommentController', function() {
    beforeEach(module('app'));

    var commentCtrl, scope, httpBackend, mdDialog, http, commentService, posts;
    var user = {
        name: 'name',
        key: 'asd234jk2l'
    };

    var reply = {"text": "reply", "id": 1};

    var comment = {
        "text": "comment",
        "id": 5,
        "data_comments": [],
        "replies": {
            1: reply
        }
    };

    var POSTS_URI = "/api/posts";

    posts = [{
                title: 'post principal', author_key: user.key,
                key: "123456", comments: "/api/posts/123456/comments",
                likes: "/api/posts/123456/likes", number_of_likes: 0, number_of_comments: 0
        }];

    beforeEach(inject(function($controller, $httpBackend, $http, $mdDialog,
            AuthService, $rootScope, CommentService) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        mdDialog = $mdDialog;
        http = $http;
        commentService = CommentService;
        
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);

        AuthService.getCurrentUser = function() {
            return new User(user);
        };

        commentCtrl = $controller('CommentController', {
            scope: scope            
        });

        commentCtrl.user = AuthService.getCurrentUser();
        commentCtrl.comment = comment;


        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    describe('canDeleteComment()', function() {
        it('Should return true', function() {
            var comment = {author_key: commentCtrl.user.key, text: "testando"};
            var result = commentCtrl.canDeleteComment(comment);
            expect(result).toBeTruthy();
        });

        it('Should return false', function() {
            var comment = {author_key: "1234", text: "testando"};
            var result = commentCtrl.canDeleteComment(comment);
            expect(result).toBeFalsy();
        });
    });

    describe('confirmCommentDeletion()', function(){
        it('Should delete the comment', function() {
            commentCtrl.post = posts[0];
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(commentService, 'deleteComment').and.callThrough();
            commentCtrl.post.data_comments = {5: comment};
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/comments/' + "5").respond(comment);
            commentCtrl.confirmCommentDeletion("$event");
            httpBackend.flush();
            expect(commentService.deleteComment).toHaveBeenCalledWith(commentCtrl.post.key, 5);
            expect(commentCtrl.post.data_comments).toEqual({});
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it('Should call deleteReply', function() {
            commentCtrl.post = posts[0];
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(commentService, 'deleteReply').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/comments/5/replies/1').respond(reply);
            commentCtrl.confirmCommentDeletion("$event", reply);
            httpBackend.flush();
            expect(commentService.deleteReply).toHaveBeenCalledWith(commentCtrl.post.key, 5, 1);
            expect(commentCtrl.comment.replies).toEqual({});
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));