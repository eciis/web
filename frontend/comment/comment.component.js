"use strict";

(function () {
    const app = angular.module('app');

    app.component('comment', {
        templateUrl: 'app/comment/comment.html',
        controller: CommentController,
        controllerAs: 'commentCtrl',
        bindings: {
            user: '=',
            post: '=',
            comment: '=',
            commentParent: '=',
            isReply: '<'
        }
    });

    function CommentController(CommentService, MessageService, ProfileService, $state, AuthService) {
        var commentCtrl = this;
        commentCtrl.user = AuthService.getCurrentUser();

        // Model to store data of a new reply on a comment
        commentCtrl.newReply = null;

        // Controll the disablement of actions
        commentCtrl.saving = false;

        let commentId, replyId, postKey;

        commentCtrl.$onInit = function () {
            postKey = commentCtrl.post.key;
            commentId = commentCtrl.isReply ? commentCtrl.commentParent.id : commentCtrl.comment.id;
            replyId = commentCtrl.isReply ? commentCtrl.comment.id : '';
        };
    
        commentCtrl.like = function () {
            commentCtrl.saving = true;
            CommentService.like(postKey, commentId, replyId)
            .then(function sucess() {
                    commentCtrl.comment.likes.push(commentCtrl.user.key);
                    commentCtrl.saving = false;
                }, function error() {
                    $state.go("app.user.home");
                    commentCtrl.saving = false;
                }
            );
        };

        commentCtrl.dislike = function () {
            commentCtrl.saving = true;
            CommentService.dislike(postKey, commentId, replyId)
            .then(function sucess() {
                    _.remove(commentCtrl.comment.likes, function (key) {
                        return commentCtrl.user.key === key;
                    });
                    commentCtrl.saving = false;
                }, function error() {
                    $state.go("app.user.home");
                    commentCtrl.saving = false;
                }
            );
        };

        commentCtrl.isDeletedPost = function isDeletedPost() {
            return commentCtrl.post.state === 'deleted';
        };

        commentCtrl.isLikedByUser = function isLikedByUser(reply) {
            return _.includes(commentCtrl.comment.likes, commentCtrl.user.key);
        };

        commentCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        commentCtrl.getReplies = function getReplies() {
            return _.values(commentCtrl.comment.replies);
        };

        commentCtrl.numberOfLikes = function numberOfLikes(reply) {
            return _.size(commentCtrl.comment.likes);
        };

        commentCtrl.numberOfReplies = function numberOfReplies() {
            return _.size(commentCtrl.comment.replies);
        };

        commentCtrl.replyComment = function replyComment() {
            if (commentCtrl.newReply) {
                commentCtrl.saving = true;
                var institutionKey = commentCtrl.user.current_institution.key;
                var promise = CommentService.replyComment(
                    postKey,
                    commentCtrl.newReply,
                    institutionKey,
                    commentId
                );

                promise.then(function success(response) {
                    var data = response;
                    commentCtrl.comment.replies[data.id] = data;

                    commentCtrl.newReply = null;
                    commentCtrl.saving = false;
                }, function error() {
                    commentCtrl.newReply = null;
                    commentCtrl.saving = false;
                });
            }
        };

        commentCtrl.deleteReply = function deleteReply() {
            CommentService.deleteReply(postKey, commentId, replyId)
                .then(function success() {
                    delete commentCtrl.commentParent.replies[replyId];
                    MessageService.showToast('Comentário excluído com sucesso');
                });
        };

        commentCtrl.deleteComment = function deleteComment() {
            CommentService.deleteComment(postKey, commentId).then(
                function success() {
                    commentCtrl.post.data_comments = commentCtrl.post.data_comments
                        .filter(comment => comment.id !== commentId);
                    commentCtrl.post.number_of_comments--;
                    MessageService.showToast('Comentário excluído com sucesso');
                });
        };

        commentCtrl.confirmCommentDeletion = function confirmCommentDeletion(event) {
            if (!commentCtrl.isDeletedPost()) {
                MessageService.showConfirmationDialog(event, 'Excluir Comentário',
                    'Este comentário será excluído e desaparecerá do referente post.'
                ).then(function () {
                    commentCtrl.isReply ? commentCtrl.deleteReply() : commentCtrl.deleteComment();
                }, function () {
                    MessageService.showToast('Cancelado');
                });
            }
        };

        commentCtrl.canDeleteComment = function canDeleteComment(reply) {
            var deletedPost = commentCtrl.post.state === 'deleted';
            if (reply) {
                var replyHasActivity = commentCtrl.numberOfLikes(reply) > 0;
                return !replyHasActivity &&
                    reply.author_key == commentCtrl.user.key && !deletedPost;
            }
            var commentHasActivity = commentCtrl.numberOfReplies() > 0 ||
                commentCtrl.numberOfLikes() > 0;
            return !commentHasActivity &&
                commentCtrl.comment.author_key == commentCtrl.user.key && !deletedPost;
        };

        commentCtrl.canReply = function canReply() {
            return commentCtrl.showReplies && !commentCtrl.isDeletedPost() &&
                !commentCtrl.isInstInactive();
        };

        commentCtrl.hideReplies = function hideReplies() {
            if (commentCtrl.isDeletedPost()) {
                var noReplies = commentCtrl.numberOfReplies() === 0;
                return commentCtrl.saving || noReplies;
            }
            return commentCtrl.saving;
        };

        commentCtrl.disableButton = function disableButton() {
            return commentCtrl.saving || commentCtrl.isDeletedPost() || commentCtrl.isInstInactive();
        };

        commentCtrl.isInstInactive = function isInstInactive() {
            return commentCtrl.post.institution_state === 'inactive';
        };

        commentCtrl.numberOfLikesMessage = function numberOfLikesMessage(reply) {
            return commentCtrl.numberOfLikes(reply) === 0 ? 'Nenhuma curtida' :
                commentCtrl.numberOfLikes(reply) === 1 ? commentCtrl.isLikedByUser(reply) ?
                    'Você curtiu isso' : '1 pessoa curtiu' :
                    commentCtrl.numberOfLikes(reply) + ' pessoas curtiram';
        };

        commentCtrl.numberOfRepliesMessage = function numberOfRepliesMessage() {
            return commentCtrl.numberOfReplies() === 0 ? 'Nenhuma resposta' :
                commentCtrl.numberOfReplies() === 1 ? '1 resposta' :
                    commentCtrl.numberOfReplies() + ' respostas';
        }

        commentCtrl.toggleReplies = function toggleReplies() {
            commentCtrl.showReplies = !commentCtrl.showReplies;
        };

        function loadShowReplies() {
            commentCtrl.showReplies = $state.current.name === 'app.post';
        }

        loadShowReplies();
    };
})();