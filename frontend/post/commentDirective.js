'use strict';

(function () {
    const app = angular.module("app");

    app.controller('CommentController', function CommentController(CommentService, MessageService, ProfileService,
        $state, AuthService) {
        var commentCtrl = this;
        commentCtrl.user = AuthService.getCurrentUser();

        // Model to store data of a new reply on a comment
        commentCtrl.newReply = null;

        // Controll the disablement of actions
        commentCtrl.saving = false;

        commentCtrl.likeOrDislike = function likeOrDislike(reply) {
            var replyId = reply ? reply.id : undefined;
            if (commentCtrl.isLikedByUser(reply)) {
                commentCtrl.saving = true;
                CommentService.dislike(commentCtrl.post.key, commentCtrl.comment.id, replyId).then(
                    function sucess() {
                        if (reply) {
                            _.remove(reply.likes, function (key) {
                                return commentCtrl.user.key === key;
                            });
                        } else {
                            _.remove(commentCtrl.comment.likes, function (key) {
                                return commentCtrl.user.key === key;
                            });
                        }
                        commentCtrl.saving = false;
                    }, function error() {
                        $state.go("app.user.home");
                        commentCtrl.saving = false;
                    }
                );
            } else {
                commentCtrl.saving = true;
                CommentService.like(commentCtrl.post.key, commentCtrl.comment.id, replyId).then(
                    function sucess() {
                        if (reply) {
                            reply.likes.push(commentCtrl.user.key);
                        } else {
                            commentCtrl.comment.likes.push(commentCtrl.user.key);
                        }
                        commentCtrl.saving = false;
                    }, function error() {
                        $state.go("app.user.home");
                        commentCtrl.saving = false;
                    }
                );
            }
        };

        commentCtrl.isDeletedPost = function isDeletedPost() {
            return commentCtrl.post.state === 'deleted';
        };

        commentCtrl.isLikedByUser = function isLikedByUser(reply) {
            if (reply) {
                return _.includes(reply.likes, commentCtrl.user.key);
            }
            return _.includes(commentCtrl.comment.likes, commentCtrl.user.key);
        };

        commentCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        commentCtrl.getReplies = function getReplies() {
            return _.values(commentCtrl.comment.replies);
        };

        commentCtrl.numberOfLikes = function numberOfLikes(reply) {
            if (reply) {
                return _.size(reply.likes);
            }
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
                    commentCtrl.post.key,
                    commentCtrl.newReply,
                    institutionKey,
                    commentCtrl.comment.id
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

        commentCtrl.deleteReply = function deleteReply(reply) {
            CommentService.deleteReply(commentCtrl.post.key, commentCtrl.comment.id, reply.id).then(
                function success() {
                    delete commentCtrl.comment.replies[reply.id];
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

        commentCtrl.confirmCommentDeletion = function confirmCommentDeletion(event, reply) {
            if (!commentCtrl.isDeletedPost()) {
                MessageService.showConfirmationDialog(event, 'Excluir Comentário',
                    'Este comentário será excluído e desaparecerá do referente post.'
                ).then(function () {
                    if (reply) {
                        commentCtrl.deleteReply(reply);
                    } else {
                        commentCtrl.deleteComment();
                    }
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
    });

    app.directive("comment", function () {
        return {
            restrict: 'E',
            templateUrl: "app/post/comment.html",
            controllerAs: "commentCtrl",
            controller: "CommentController",
            scope: {},
            bindToController: {
                comment: '=',
                post: '=',
                user: '='
            }
        };
    });
})();