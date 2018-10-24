'use strict';

(describe('Test CommentController', function() {
    beforeEach(module('app'));
    
    const POSTS_URI = "/api/posts";
    let commentCtrl, scope, httpBackend, state;
    let commentService, messageService, q, deferred;
    
    const user = {
        name: 'name',
        key: 'user-key',
        state: 'active',
        current_institution: {name: 'inst', key:'inst-key'}
    };

    let nilReply = {};
    let reply = {
        text: "reply", 
        id: 1,
        likes: []
    };

    let comment = {
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
        const fakeResponse = callback => callback();
        return {
            then: fakeResponse,
            catch: fakeResponse,
            finally: fakeResponse
        };
    };

    beforeEach(inject(function ($controller, $httpBackend, $state,
            AuthService, $rootScope, CommentService, MessageService, $q) {
        httpBackend = $httpBackend;
        state = $state;
        commentService = CommentService;
        messageService = MessageService;
        q = $q;
        deferred = q.defer();

        AuthService.login(user);

        scope = $rootScope.$new();
        commentCtrl = $controller('CommentController', {
            scope: scope
        });

        commentCtrl.user = AuthService.getCurrentUser();
        commentCtrl.comment = {...comment, likes: [], replies: {}};
        commentCtrl.post = {...post};
        commentCtrl.$onInit();
    }));

    afterEach(function() {
        scope.$destroy();
        comment = {...comment, likes: [], replies: {}};
        reply = {...reply, likes: []};
        nilReply = {};
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('onInit', function() {
        beforeEach(function() {
            commentCtrl.post = {...post};
            commentCtrl.onDelete = undefined;
        });
        
        it('should set the post property to an instance of Post', function() {
            commentCtrl.$onInit();
            expect(commentCtrl.post).toEqual(new Post(post));
        });

        it(`should set the onDelete to refence the function deleteComment
            when the component is loading a comment`, function() {
            commentCtrl.$onInit();
            expect(commentCtrl.onDelete).toEqual(commentCtrl.deleteComment);
        });

        it(`should set the onDelete to refence the function deleteReply
            when the component is loading a reply`, function() {
            commentCtrl.reply = {...reply};
            commentCtrl.$onInit();
            expect(commentCtrl.onDelete).toEqual(commentCtrl.deleteReply);
        });

        it(`should call the function setReplyId, 
            setCurrentComment and setShowReplies`, function () {
            spyOn(commentCtrl, 'setReplyId');
            spyOn(commentCtrl, 'setCurrentComment');
            spyOn(commentCtrl, 'setShowReplies');
            commentCtrl.$onInit();
            expect(commentCtrl.setReplyId).toHaveBeenCalled();
            expect(commentCtrl.setCurrentComment).toHaveBeenCalled();
            expect(commentCtrl.setShowReplies).toHaveBeenCalled();
        });
    });

    describe('setReplyId', function() {
        it('shoult set replyId to null, when the component is loading a comment', function() {
            commentCtrl.reply = null;
            commentCtrl.setReplyId();
            expect(commentCtrl.replyId).toEqual(null);
        });

        it('shoult set replyId to the reply id, when the component is loading a reply', function() {
            commentCtrl.reply = reply;
            commentCtrl.setReplyId();
            expect(commentCtrl.replyId).toEqual(reply.id);
        });
    });

    describe('setCurrentComment', function () {
        it(`should set the currentComment to be the comment
            when the component is loading a comment`, function () {
            commentCtrl.currentComment = {};
            commentCtrl.reply = null;
            commentCtrl.setCurrentComment();
            expect(commentCtrl.currentComment).toEqual(comment);
        });

        it(`should set the currentComment to be the reply 
            when the component is loading a reply`, function () {
            commentCtrl.currentComment = {};
            commentCtrl.reply = {...reply};
            commentCtrl.setCurrentComment();
            expect(commentCtrl.currentComment).toEqual(reply);
        });
    });

    describe('setShowReplies', function(){
        it(`should be false when the current 
            state is not on the post page`, function() {
            state.current.name = 'app.other';
            commentCtrl.setShowReplies();
            expect(commentCtrl.showReplies).toBeFalsy();
        });

        it(`should be true when the current 
            state on the post page`, function() {
            state.current.name = 'app.post';
            commentCtrl.setShowReplies();
            expect(commentCtrl.showReplies).toBeTruthy();
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
        beforeEach(function() {
            commentCtrl.saving = true;
            spyOn(commentService, 'like').and.returnValue(deferred.promise);
            spyOn(commentCtrl, 'addLike').and.callThrough();
            spyOn(messageService, 'showToast');
            expect(commentCtrl.numberOfLikes()).toEqual(0);
        });

        afterEach(function() {
            expect(commentCtrl.saving).toBeFalsy();
        });

        it('should like the comment', function() {
            deferred.resolve();
            commentCtrl.like();
            scope.$apply();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.addLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
        });

        it('should not like the comment', function() {
            deferred.reject();
            commentCtrl.like();
            scope.$apply();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.addLike).not.toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            expect(messageService.showToast).toHaveBeenCalledWith("Não foi possível curtir o comentário");
        });

        it('should like the reply', function() {
            commentCtrl.reply = {...reply};
            commentCtrl.setReplyId();
            commentCtrl.setCurrentComment();
            deferred.resolve();
            commentCtrl.like();
            scope.$apply();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, reply.id);
            expect(commentCtrl.addLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
        });

        it('should not like the reply', function() {
            commentCtrl.reply = {...reply};
            commentCtrl.setReplyId();
            commentCtrl.setCurrentComment();
            deferred.reject();
            commentCtrl.like();
            scope.$apply();
            expect(commentService.like).toHaveBeenCalledWith(post.key, comment.id, reply.id);
            expect(commentCtrl.addLike).not.toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
            expect(messageService.showToast).toHaveBeenCalledWith("Não foi possível curtir o comentário");
        });
    });

    describe('dislike', function () {
        beforeEach(function() {
            commentCtrl.saving = true;
            spyOn(commentService, 'dislike').and.returnValue(deferred.promise);
            spyOn(commentCtrl, 'removeLike').and.callThrough();
            spyOn(messageService, 'showToast');
        });

        afterEach(function() {
            expect(commentCtrl.saving).toBeFalsy();
        });

        it('should dislike the comment', function() {
            commentCtrl.reply = null;
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            deferred.resolve();
            commentCtrl.dislike();
            scope.$apply();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
        });

        it('should not dislike the comment', function() {
            commentCtrl.reply = null;
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            deferred.reject();
            commentCtrl.dislike();
            scope.$apply();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).not.toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            expect(messageService.showToast).toHaveBeenCalledWith("Não foi possível descurtir o comentário");
        });

        it('should dislike the reply', function() {
            commentCtrl.reply = {...reply};
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            deferred.resolve();
            commentCtrl.dislike();
            scope.$apply();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(0);
        });

        it('should not dislike the reply', function() {
            commentCtrl.reply = {...reply};
            commentCtrl.setCurrentComment();
            commentCtrl.addLike();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            deferred.reject();
            commentCtrl.dislike();
            scope.$apply();
            expect(commentService.dislike).toHaveBeenCalledWith(post.key, comment.id, null);
            expect(commentCtrl.removeLike).not.toHaveBeenCalled();
            expect(commentCtrl.numberOfLikes()).toEqual(1);
            expect(messageService.showToast).toHaveBeenCalledWith("Não foi possível descurtir o comentário");
        });
    });

    describe('replyComment', function () {
        it('should add a reply to the comment', function () {
            commentCtrl.newReply = reply.text;
            expect(commentCtrl.comment.replies).toEqual({});
            const data = {...reply, id: 'new-reply-id'};
            spyOn(commentService, 'replyComment').and.returnValue(deferred.promise);
            deferred.resolve(data);
            commentCtrl.replyComment();
            scope.$apply();
            expect(commentService.replyComment).toHaveBeenCalledWith(
                post.key, reply.text, user.current_institution.key, comment.id
            );
            const replies = {};
            replies[data.id] = data;
            expect(commentCtrl.comment.replies).toEqual(replies);
        });

        it('should not create a new reply when newReply is null', function () {
            commentCtrl.newReply = null;
            expect(commentCtrl.comment.replies).toEqual({});
            spyOn(commentService, 'replyComment').and.callFake(fakeCallback);
            commentCtrl.replyComment();
            expect(commentService.replyComment).not.toHaveBeenCalled();
            expect(commentCtrl.comment.replies).toEqual({});
        });
    });

    describe('deleteReply', function () {
        it('should delete the reply', function () {
            const replies = {};
            commentCtrl.reply = {...reply};
            replies[reply.id] = commentCtrl.reply;
            replies['nil-key'] = nilReply;
            commentCtrl.comment = {...comment , replies};
            commentCtrl.setReplyId();
            expect(commentCtrl.comment.replies).toEqual(replies);
            spyOn(commentService, 'deleteReply').and.callThrough();
            spyOn(messageService, 'showToast');
            httpBackend.expect(
                'DELETE', POSTS_URI + '/' + post.key + '/comments/'+ comment.id +'/replies/'+ reply.id
            ).respond(reply);
            commentCtrl.deleteReply();
            httpBackend.flush();
            expect(commentService.deleteReply).toHaveBeenCalledWith(post.key, comment.id, reply.id);
            expect(messageService.showToast).toHaveBeenCalledWith('Comentário excluído com sucesso');
            expect(commentCtrl.comment.replies).toEqual({'nil-key': nilReply});
        });
    });

    describe('deleteComment', function () {
        it('should delete the comment', function () {
            commentCtrl.post.data_comments = [comment];
            expect(commentCtrl.post.data_comments).toEqual([comment]);
            spyOn(commentService, 'deleteComment').and.callThrough();
            spyOn(messageService, 'showToast');
            httpBackend.expect(
                'DELETE', POSTS_URI + '/' + post.key + '/comments/' + comment.id
            ).respond(comment);
            commentCtrl.deleteComment();
            httpBackend.flush();
            expect(commentService.deleteComment).toHaveBeenCalledWith(post.key, comment.id);
            expect(messageService.showToast).toHaveBeenCalledWith('Comentário excluído com sucesso');
            expect(commentCtrl.post.data_comments).toEqual([]);
        });
    });

    describe('commentDeletionDialog()', function(){
        beforeEach(function() {
            spyOn(messageService, 'showConfirmationDialog').and.returnValue(deferred.promise);
            spyOn(commentService, 'deleteComment').and.callFake(fakeCallback);
            spyOn(commentService, 'deleteReply').and.callFake(fakeCallback);
        });

        it('Should delete the comment when accepted it', function() {
            commentCtrl.post.data_comments = [comment];
            deferred.resolve();
            commentCtrl.commentDeletionDialog("$event");
            scope.$apply();
            expect(commentService.deleteComment).toHaveBeenCalledWith(commentCtrl.post.key, comment.id);
            expect(commentCtrl.post.data_comments).toEqual([]);
        });

        it('Should not delete the comment when rejected it', function() {
            commentCtrl.post.data_comments = [comment];
            deferred.reject();
            commentCtrl.commentDeletionDialog("$event");
            scope.$apply();
            expect(commentService.deleteComment).not.toHaveBeenCalled();
            expect(commentCtrl.post.data_comments).toEqual([comment]);
        });

        it('Should delete the reply when accepted it', function() {
            comment.replies[reply.id] = reply;
            commentCtrl.reply = reply;
            commentCtrl.$onInit();
            deferred.resolve();
            commentCtrl.commentDeletionDialog("$event", reply);
            scope.$apply();
            expect(commentService.deleteReply).toHaveBeenCalledWith(commentCtrl.post.key, comment.id, reply.id);
            expect(commentCtrl.comment.replies).toEqual({});
        });

        it('Should not delete the reply when rejected it', function() {
            const replies = {};
            replies[reply.id] = {...reply};
            commentCtrl.comment.replies = {...replies};
            commentCtrl.reply = {...reply};
            commentCtrl.$onInit();
            deferred.reject();
            commentCtrl.commentDeletionDialog("$event", reply);
            scope.$apply();
            expect(commentService.deleteReply).not.toHaveBeenCalled();
            expect(commentCtrl.comment.replies).toEqual(replies);
        });
    });

    describe('addLike', function() {
        it('should add a like to the comment', function () {
            expect(commentCtrl.currentComment.likes).toEqual([]);
            commentCtrl.addLike();
            expect(commentCtrl.currentComment.likes).toEqual([user.key]);
        });
    });

    describe('removeLike', function() {
        it('should remove a like from the comment', function () {
            commentCtrl.comment = {...comment, likes: [user.key]};
            commentCtrl.setCurrentComment();
            expect(commentCtrl.currentComment.likes).toEqual([user.key]);
            commentCtrl.removeLike();
            expect(commentCtrl.currentComment.likes).toEqual([]);
        });
    })

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
            commentCtrl.comment.likes = ['user-key-01', 'user-key-02'];
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

        it(`should be true when the post has no activity, 
            it is not a deleted post and the user is the author`, function () {
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
        it('should return a message when there is no like', function () {
            commentCtrl.comment.likes = [];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('Nenhuma curtida');
        });

        it('should return a message when there is just one like', function () {
            commentCtrl.comment.likes = ['user-key-01'];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('1 pessoa curtiu');
        });

        it('should return a message when there is more than one like ', function () {
            commentCtrl.comment.likes = ['user-key-01', 'user-key-02'];
            expect(commentCtrl.numberOfLikesMessage()).toEqual('2 pessoas curtiram');
        });
    });

    describe('numberOfRepliesMessage', function() {
        it('should return a message when there is no reply', function () {
            commentCtrl.comment.replies = {};
            expect(commentCtrl.numberOfRepliesMessage()).toEqual('Nenhuma resposta');
        });

        it('should return a message when there is just one reply', function () {
            commentCtrl.comment.replies = {1: nilReply};
            expect(commentCtrl.numberOfRepliesMessage()).toEqual('1 resposta');
        });

        it('should return a message when there is more than one reply', function () {
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