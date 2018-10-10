'use strict';

(describe('Test CommentController', function() {
    beforeEach(module('app'));
    
    const POSTS_URI = "/api/posts";
    let commentCtrl, scope, httpBackend, mdDialog, commentService;
    
    let user = {
        name: 'name',
        key: 'user-key',
        state: 'active'
    };

    let reply = {
        text: "reply", 
        id: 1
    };

    let comment = {
        text: "comment",
        id: 5,
        data_comments: [],
        replies: {},
        author_key: user.key
    };

    let post = {
        title: 'post principal', author_key: user.key,
        key: "123456", comments: "/api/posts/123456/comments",
        likes: "/api/posts/123456/likes", 
        number_of_likes: 0, number_of_comments: 0,
        state: 'published'
    };
    
    const fakeCallback = function(){
        return {
            then: function(callback) {
                return callback();
            }
        };
    };

    beforeEach(inject(function ($controller, $httpBackend, $mdDialog,
            AuthService, $rootScope, CommentService) {
        httpBackend = $httpBackend;
        mdDialog = $mdDialog;
        commentService = CommentService;

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);

        AuthService.login(user);

        scope = $rootScope.$new();
        commentCtrl = $controller('CommentController', {
            scope: scope
        });

        commentCtrl.user = AuthService.getCurrentUser();
        commentCtrl.comment = comment;
        commentCtrl.post = post;
        commentCtrl.setupIds();
    }));

    afterEach(function() {
        scope.$destroy();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    describe('canDeleteComment()', function() {
        it('Should be true when the user is the author', function() {
            expect(commentCtrl.canDeleteComment()).toBeTruthy();
        });

        it('Should be false when the user is not the author', function() {
            commentCtrl.comment = {author_key: "other-key", text: "testando"};
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('Should be false when the post is deleted', function() {
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('Should be false when the comment has replies', function() {
            commentCtrl.comment.replies = {1: reply};
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('Should be false when the comment has replies', function() {
            const nilComment = {};
            commentCtrl.comment.likes = {1: nilComment};
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });
    });

    describe('canReply()', function() {
        it('Should return true', function() {
            commentCtrl.post.state = "active";
            commentCtrl.showReplies = true;
            expect(commentCtrl.canReply()).toBeTruthy();
        });

        it('Should return false', function() {
            commentCtrl.post.state = "deleted";
            commentCtrl.showReplies = true;
            expect(commentCtrl.canReply()).toBeFalsy();
        });

        it('Should return false', function() {
            commentCtrl.post.state = "active";
            commentCtrl.post.institution_state = 'inactive';
            commentCtrl.showReplies = true;
            expect(commentCtrl.canReply()).toBeFalsy();
        });
    });

    describe('confirmCommentDeletion()', function(){

        it('Should delete the comment', function() {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(fakeCallback);
            spyOn(commentService, 'deleteComment').and.callThrough();
            commentCtrl.post.data_comments = [comment];
            httpBackend.expect('DELETE', POSTS_URI + '/' + post.key + '/comments/' + "5").respond(comment);
            commentCtrl.confirmCommentDeletion("$event");
            httpBackend.flush();
            expect(commentService.deleteComment).toHaveBeenCalledWith(commentCtrl.post.key, 5);
            expect(commentCtrl.post.data_comments).toEqual([]);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it('Should call deleteReply', function() {
            comment.replies[reply.id] = reply;
            commentCtrl.isReply = true;
            commentCtrl.comment = reply;
            commentCtrl.commentParent = comment;
            commentCtrl.setupIds();

            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(fakeCallback);
            spyOn(commentService, 'deleteReply').and.callThrough();
            
            httpBackend.expect(
                'DELETE', POSTS_URI + '/' + post.key + '/comments/'+ comment.id +'/replies/'+ reply.id
            ).respond(reply);
            commentCtrl.confirmCommentDeletion("$event", reply);
            httpBackend.flush();

            expect(commentService.deleteReply).toHaveBeenCalledWith(commentCtrl.post.key, comment.id, reply.id);
            expect(commentCtrl.commentParent.replies).toEqual({});
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));