"use strict";

(function () {
    angular.module('app')
        .controller("CommentController", CommentController)
        .component('comment', {
            templateUrl: 'app/comment/comment.html',
            controller: "CommentController",
            controllerAs: 'commentCtrl',
            bindings: {
                user: '=',
                post: '=',
                comment: '=',
                reply: '='
            }
        });

    function CommentController(CommentService, MessageService, ProfileService, $state, AuthService) {
        const commentCtrl = this;

        commentCtrl.user = AuthService.getCurrentUser();

        // Model to store data of a new reply on a comment
        commentCtrl.newReply = null;

        // Controll the disablement of actions
        commentCtrl.saving = false;

        commentCtrl.$onInit = function () {
            commentCtrl.setReplyId();
            commentCtrl.loadCommentBody();
        };
        
        commentCtrl.setReplyId = function () {
            commentCtrl.replyId = commentCtrl.reply ? commentCtrl.reply.id : null;
        }

        commentCtrl.loadCommentBody = function () {
            commentCtrl.currentComment = commentCtrl.reply ? commentCtrl.reply : commentCtrl.comment;
        };

        commentCtrl.like = function () {
            commentCtrl.saving = true;
            CommentService.like(commentCtrl.post.key, commentCtrl.comment.id, commentCtrl.replyId)
                .then(function sucess() {
                    commentCtrl.addLike();
                    commentCtrl.saving = false;
                }, function error() {
                    $state.go("app.user.home");
                    commentCtrl.saving = false;
                });
        };

        commentCtrl.dislike = function () {
            commentCtrl.saving = true;
            CommentService.dislike(commentCtrl.post.key, commentCtrl.comment.id, commentCtrl.replyId)
                .then(function sucess() {
                    commentCtrl.removeLike();
                    commentCtrl.saving = false;
                }, function error() {
                    $state.go("app.user.home");
                    commentCtrl.saving = false;
                });
        };

        commentCtrl.replyComment = function replyComment() {
            if (commentCtrl.newReply) {
                commentCtrl.saving = true;
                var institutionKey = commentCtrl.user.current_institution.key;
                CommentService.replyComment(
                    commentCtrl.post.key, commentCtrl.newReply, institutionKey, commentCtrl.comment.id
                ).then(function success(data) {
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
            CommentService.deleteReply(commentCtrl.post.key, commentCtrl.comment.id, commentCtrl.replyId)
                .then(function success() {
                    delete commentCtrl.comment.replies[commentCtrl.replyId];
                    MessageService.showToast('Comentário excluído com sucesso');
                });
        };

        commentCtrl.deleteComment = function deleteComment() {
            CommentService.deleteComment(commentCtrl.post.key, commentCtrl.comment.id).then(
                function success() {
                    commentCtrl.post.data_comments = commentCtrl.post.data_comments
                        .filter(comment => comment.id !== commentCtrl.comment.id);
                    commentCtrl.post.number_of_comments--;
                    MessageService.showToast('Comentário excluído com sucesso');
                });
        };

        commentCtrl.confirmCommentDeletion = function confirmCommentDeletion(event) {
            MessageService.showConfirmationDialog(event, 'Excluir Comentário',
                'Este comentário será excluído e desaparecerá do referente post.'
            ).then(function () {
                commentCtrl.reply ? commentCtrl.deleteReply() : commentCtrl.deleteComment();
            }, function () {
                MessageService.showToast('Cancelado');
            });
        };

        commentCtrl.addLike = function() {
            commentCtrl.currentComment.likes.push(commentCtrl.user.key);
        }

        commentCtrl.removeLike = function() {
            commentCtrl.currentComment.likes = commentCtrl.currentComment.likes
                .filter(userKey => userKey !== commentCtrl.user.key);
        }

        commentCtrl.isDeletedPost = function isDeletedPost() {
            return commentCtrl.post.state === 'deleted';
        };

        commentCtrl.isLikedByUser = function isLikedByUser() {
            return _.includes(commentCtrl.currentComment.likes, commentCtrl.user.key);
        };

        commentCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        commentCtrl.getReplies = function getReplies() {
            return commentCtrl.reply ? [] : _.values(commentCtrl.currentComment.replies);
        };

        commentCtrl.numberOfLikes = function numberOfLikes() {
            return _.size(commentCtrl.currentComment.likes);
        };

        commentCtrl.numberOfReplies = function numberOfReplies() {
            return _.size(commentCtrl.currentComment.replies);
        };

        commentCtrl.canDeleteComment = function canDeleteComment() {
            const hasActivity = commentCtrl.numberOfReplies() > 0 || commentCtrl.numberOfLikes() > 0;
            const userIsAuthor = commentCtrl.currentComment.author_key == commentCtrl.user.key
            return !hasActivity && !commentCtrl.isDeletedPost() && userIsAuthor;
        };

        commentCtrl.canReply = function canReply() {
            return commentCtrl.showReplies && !commentCtrl.isDeletedPost() &&
                !commentCtrl.isInstInactive();
        };

        commentCtrl.hideReplies = function hideReplies() {
            const noReplies = commentCtrl.numberOfReplies() === 0;
            return commentCtrl.isDeletedPost() && noReplies || commentCtrl.saving;
        };

        commentCtrl.disableButton = function disableButton() {
            return commentCtrl.saving || commentCtrl.isDeletedPost() || commentCtrl.isInstInactive();
        };

        commentCtrl.isInstInactive = function isInstInactive() {
            return commentCtrl.post.institution_state === 'inactive';
        };

        commentCtrl.numberOfLikesMessage = function numberOfLikesMessage() {
            const likesAmount = commentCtrl.numberOfLikes();
            let message = likesAmount > 1 ? likesAmount + ' pessoas curtiram' : '1 pessoa curtiu';
            message = likesAmount === 0 ? 'Nenhuma curtida' : message;
            return message;
        };

        commentCtrl.numberOfRepliesMessage = function numberOfRepliesMessage() {
            const repliesAmount = commentCtrl.numberOfReplies();
            let message = repliesAmount > 1 ? repliesAmount + ' respostas' : '1 resposta';
            message = repliesAmount === 0 ? 'Nenhuma resposta' : message;
            return message;
        }

        commentCtrl.toggleReplies = function toggleReplies() {
            commentCtrl.showReplies = !commentCtrl.showReplies;
        };

        (function setReplies() {
            commentCtrl.showReplies = $state.current.name === 'app.post';
        })();
    };
})();