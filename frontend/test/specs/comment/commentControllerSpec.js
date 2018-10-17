'use strict';

(fdescribe('Test CommentController', function() {
    beforeEach(module('app'));
    
    const POSTS_URI = "/api/posts";
    let commentCtrl, scope, httpBackend, mdDialog;
    let commentService, profileService;
    
    const user = {
        name: 'name',
        key: 'user-key',
        state: 'active'
    };

    const nilReply = {};
    const reply = {
        text: "reply", 
        id: 1,
        likes: []
    };

    const comment = {
        text: "comment",
        id: 5,
        data_comments: [],
        replies: {},
        author_key: user.key,
        likes: []
    };

    const post = {
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
            AuthService, $rootScope, CommentService, ProfileService) {
        httpBackend = $httpBackend;
        mdDialog = $mdDialog;
        commentService = CommentService;
        profileService = ProfileService;

        AuthService.login(user);

        scope = $rootScope.$new();
        commentCtrl = $controller('CommentController', {
            scope: scope
        });

        commentCtrl.user = AuthService.getCurrentUser();
        commentCtrl.comment = {...comment};
        commentCtrl.post = {...post};
        commentCtrl.setReplyId();
        commentCtrl.setCurrentComment();
    }));

    afterEach(function() {
        scope.$destroy();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('setReplyId', function() {
        it('shoult set replyId to null', function() {
            commentCtrl.reply = null;
            commentCtrl.setReplyId();
            expect(commentCtrl.replyId).toEqual(null);
        });

        it('shoult set replyId to null', function() {
            commentCtrl.reply = reply;
            commentCtrl.setReplyId();
            expect(commentCtrl.replyId).toEqual(reply.id);
        });
    });

    describe('setCurrentComment', function () {
        it('should set the currentComment to be the comment', function () {
            commentCtrl.currentComment = {};
            commentCtrl.reply = null;
            commentCtrl.setCurrentComment();
            expect(commentCtrl.currentComment).toEqual(comment);
        });

        it('should set the currentComment to be the reply', function () {
            commentCtrl.currentComment = {};
            commentCtrl.reply = {...reply};
            commentCtrl.setCurrentComment();
            expect(commentCtrl.currentComment).toEqual(reply);
        });
    });

    describe('canDeleteComment()', function() {
        it('Should be true when the user is the author', function() {
            expect(commentCtrl.canDeleteComment()).toBeTruthy();
        });

        it('Should be false when the user is not the author', function() {
            commentCtrl.comment = {author_key: "other-key", text: "testando"};
            commentCtrl.setCurrentComment();
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

    describe('like', function () {
        it('should like the comment', function() {
            commentCtrl.reply = null;
            commentCtrl.setCurrentComment();
            spyOn(commentService, 'like').and.callFake(fakeCallback);
            spyOn(commentCtrl, 'addLike').and.callThrough();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            commentCtrl.like();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.addLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            expect(commentCtrl.saving).toBeFalsy();
        });

        it('should like the reply', function() {
            commentCtrl.reply = {...reply};
            commentCtrl.setReplyId();
            commentCtrl.setCurrentComment();
            spyOn(commentService, 'like').and.callFake(fakeCallback);
            spyOn(commentCtrl, 'addLike').and.callThrough();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            commentCtrl.like();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, reply.id);
            expect(commentCtrl.addLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            expect(commentCtrl.saving).toBeFalsy();
        });
    });

    describe('dislike', function () {
        it('should dislike the comment', function() {
            commentCtrl.reply = null;
            commentCtrl.comment = {...comment, likes: []};
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            spyOn(commentService, 'dislike').and.callFake(fakeCallback);
            spyOn(commentCtrl, 'removeLike').and.callThrough();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            commentCtrl.dislike();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            expect(commentCtrl.saving).toBeFalsy();
        });

        it('should dislike the reply', function() {
            commentCtrl.reply = {...reply, likes: []};
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            spyOn(commentService, 'dislike').and.callFake(fakeCallback);
            spyOn(commentCtrl, 'removeLike').and.callThrough();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            commentCtrl.dislike();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            expect(commentCtrl.saving).toBeFalsy();
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
            commentCtrl.reply = reply;
            commentCtrl.setReplyId();
            commentCtrl.setCurrentComment();
            
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(fakeCallback);
            spyOn(commentService, 'deleteReply').and.callThrough();
            
            httpBackend.expect(
                'DELETE', POSTS_URI + '/' + post.key + '/comments/'+ comment.id +'/replies/'+ reply.id
            ).respond(reply);
            commentCtrl.confirmCommentDeletion("$event", reply);
            httpBackend.flush();

            expect(commentService.deleteReply).toHaveBeenCalledWith(commentCtrl.post.key, comment.id, reply.id);
            expect(commentCtrl.comment.replies).toEqual({});
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('isDeletedPost', function() {
        it('should be true when the post is deleted', function() {
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.isDeletedPost()).toBeTruthy();
        });

        it('should be false when the post is published', function() {
            commentCtrl.post.state = 'published';
            expect(commentCtrl.isDeletedPost()).toBeFalsy();
        });
    });

    describe('isLikedByUser', function() {
        it('should be true when the post is liked by the user', function() {
            commentCtrl.addLike();
            expect(commentCtrl.isLikedByUser()).toBeTruthy();
        });

        it('should be false when the post is not liked by the user', function() {
            commentCtrl.removeLike();
            expect(commentCtrl.isLikedByUser()).toBeFalsy();
        });
    });

    describe('getReplies', function() {
        it('should get the comment replies', function () {
            expect(commentCtrl.getReplies()).toEqual([]);
            commentCtrl.comment.replies[reply.id] = {...reply};
            // add reply to comment
            const commentReplies = Object.values(commentCtrl.comment.replies);
            expect(commentCtrl.getReplies()).toEqual(commentReplies);
        });

        it('should return an empty list when the comment is a reply', function () {
            commentCtrl.comment.replies[reply.id] = {...reply};
            commentCtrl.reply = {...reply};
            expect(commentCtrl.getReplies()).toEqual([]);
        });
    });

    describe('numberOfLikes', function () {
        it('should return the number of likes of a comment', function () {
            commentCtrl.comment.likes = [];
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            commentCtrl.comment.likes = [{id: 'like01'}, {id: 'like02'}];
            expect(commentCtrl.numberOfLikes()).toEqual(2);
        });

        it('should return the number of likes of a reply', function () {
            commentCtrl.reply = {...reply, likes:[]};
            commentCtrl.setCurrentComment();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            commentCtrl.reply = {
                ...reply, 
                likes: [{id: 'like01'}, {id: 'like02'}]
            };
            commentCtrl.setCurrentComment();
            expect(commentCtrl.numberOfLikes()).toEqual(2);
        });
    }); 

    describe('numberOfReplies', function () {
        it('should return the number of replies of a comment', function() {
            commentCtrl.comment.replies = {};
            expect(commentCtrl.numberOfReplies()).toEqual(0);
            commentCtrl.comment.replies = {1: nilReply, 2: nilReply};
            expect(commentCtrl.numberOfReplies()).toEqual(2);
        });
    });

    describe('canDeleteComment', function () {
        beforeEach(function() {
            commentCtrl.comment.likes = [];
            commentCtrl.comment.replies = {};
            commentCtrl.comment.author_key = user.key;
            commentCtrl.post.state = 'published';
        })

        it('should be true when the post has no activity', function () {
            expect(commentCtrl.canDeleteComment()).toBeTruthy();
        });

        it('should be false when the post is deleted', function () {
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('should be false when the comment has likes', function () {
            commentCtrl.addLike();
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('should be false when the comment has replies', function () {
            commentCtrl.comment.replies = {1: nilReply};
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });

        it('should be false when the user is not the post author', function () {
            commentCtrl.comment.author_key = 'other-user-key';
            expect(commentCtrl.canDeleteComment()).toBeFalsy();
        });
    });

    describe('canReply', function () {
        beforeEach(function() {
            commentCtrl.showReplies = true;
            commentCtrl.post.state = 'published';
            commentCtrl.post.institution_state ='active';
        })

        it(`should be true when the post inst is active, 
            the post is published and the showReplies is true`, function() {
            expect(commentCtrl.canReply()).toBeTruthy();
        })

        it('should be false when the flag showReplies is false', function () {
            commentCtrl.showReplies = false;
            expect(commentCtrl.canReply()).toBeFalsy();
        });

        it('should be false when the post is deleted', function () {
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.canReply()).toBeFalsy();
        });

        it('should be false when the post institution is inactive', function () {
            commentCtrl.post.institution_state ='inactive';
            expect(commentCtrl.canReply()).toBeFalsy();
        });
        
    });

    describe('hideReplies', function () {
        beforeEach(function() {
            commentCtrl.comment.replies = {1: nilReply};
            commentCtrl.saving = false;
            commentCtrl.post.state = 'published';
        });

        it('should be true when the post has no replies and is deleted', function () {
            commentCtrl.comment.replies = {};
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.hideReplies()).toBeTruthy();
        });

        it('should be true when the flag saving is true', function () {
            commentCtrl.saving = true;
            expect(commentCtrl.hideReplies()).toBeTruthy();
        });

        it(`should be false when the flag saving is false and the post 
            is not delete or the comment has no replies`, function () {
            expect(commentCtrl.hideReplies()).toBeFalsy();
        });
    });

    describe('disableButton', function () {
        beforeEach(function() {
            commentCtrl.saving = false;
            commentCtrl.post.state = 'published';
            commentCtrl.post.institution_state = 'active';
        })

        it(`should be false when the post inst is active, 
            the post is published and the saving flag is false`, function() {
            expect(commentCtrl.disableButton()).toBeFalsy();
        })

        it('should be true when the saving flag is true', function () {
            commentCtrl.saving = true;
            expect(commentCtrl.disableButton()).toBeTruthy();
        });

        it('should be true when the post is deleted', function () {
            commentCtrl.post.state = 'deleted';
            expect(commentCtrl.disableButton()).toBeTruthy();
        });

        it('should be true when the post institution is inactive', function () {
            commentCtrl.post.institution_state = 'inactive';
            expect(commentCtrl.disableButton()).toBeTruthy();
        });
    });

    describe('isInstInactive', function () {
        it('should be true when the post institution is inactive', function() {
            commentCtrl.post.institution_state = 'inactive';
            expect(commentCtrl.isInstInactive()).toBeTruthy();
        });

        it('should be true when the post institution is inactive', function() {
            commentCtrl.post.institution_state = 'active';
            expect(commentCtrl.isInstInactive()).toBeFalsy();
        });
    });

    describe('numberOfLikesMessage', function() {
        it('should return a message when there is no like ', function () {
            commentCtrl.comment.likes = [];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('Nenhuma curtida');
        });

        it('should return a message when there is just one like ', function () {
            commentCtrl.comment.likes = [{id: 'like01'}];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('1 pessoa curtiu');
        });

        it('should return a message when there is more than one like ', function () {
            commentCtrl.comment.likes = [{id: 'like01'}, {id: 'like02'}];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('2 pessoas curtiram');
        });
    });

    describe('numberOfRepliesMessage', function() {
        it('should return a message when there is no reply ', function () {
            commentCtrl.comment.replies = {};
            expect(commentCtrl.numberOfRepliesMessage()).toEqual('Nenhuma resposta');
        });

        it('should return a message when there is just one like ', function () {
            commentCtrl.comment.replies = {1: nilReply};
            expect(commentCtrl.numberOfRepliesMessage()).toEqual('1 resposta');
        });

        it('should return a message when there is more than one like ', function () {
            commentCtrl.comment.replies = {1: nilReply, 2: nilReply};
            expect(commentCtrl.numberOfRepliesMessage()).toEqual('2 respostas');
        });
    });

    describe('toggleReplies', function() {
        it('should change negate the current value of the showReplies flag', function () {
            expect(commentCtrl.showReplies).toBeFalsy();
            commentCtrl.toggleReplies();
            expect(commentCtrl.showReplies).toBeTruthy();
        });
    });

}));