(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController(PostService, $state, 
        STATES, MessageService, ngClipboard, AuthService, $mdDialog) {
        var postCtrl = this;

        postCtrl.post = null;

        postCtrl.user = AuthService.getCurrentUser();

        const EDIT_POST_PERMISSION = 'edit_post';

        postCtrl.isHiden = function isHiden() {
            var isDeleted = postCtrl.post.state == 'deleted';
            var hasNoComments = postCtrl.post.number_of_comments === 0;
            var hasNoLikes = postCtrl.post.number_of_likes === 0;
            var hasNoActivity = hasNoComments && hasNoLikes;

            return postCtrl.post.state === 'deleted' && hasNoActivity;
        };

        /**
         * It copies the post's url to the clipboard
         */
        postCtrl.copyLink = function copyLink() {
            var url = Utils.generateLink('/post/' + postCtrl.post.key);
            ngClipboard.toClipboard(url);
            MessageService.showToast("O link foi copiado");
        };

        /**
         * Refreshes the post by retrieving it from
         * the server once again.
         */
        postCtrl.reloadPost = function reloadPost() {
            var type_survey = postCtrl.post.type_survey;
            postCtrl.post.type_survey = '';
            return PostService.getPost(postCtrl.post.key)
            .then(function success(response) {
                response.data_comments = Object.values(response.data_comments);
                postCtrl.post = response;
            }, function error(response) {
                postCtrl.post.type_survey = type_survey;
            });
        };

        /**
         * Open up a dialog that allows the user to share
         * the post.
         */
        postCtrl.share = function share(event) {
            const post = getOriginalPost();
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: 'app/post/share_post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    user: postCtrl.user,
                    post: post,
                    addPost: true
                }
            });
        };

        /**
         * Add the user to the post's subscribers list
         * what makes him to receive the notifications realated
         * to the post.
         */
        postCtrl.addSubscriber = function addSubscriber() {
            PostService.addSubscriber(postCtrl.post.key).then(function success() {
                MessageService.showToast('Esse post foi marcado como de seu interesse.');
                postCtrl.post.subscribers.push(postCtrl.user.key);
            });
        };

        /**
         * Removes the user from the post's subscribers list
         * peventing him of receive notifications related to the post.
         */
        postCtrl.removeSubscriber = function removeSubscriber() {
            PostService.removeSubscriber(postCtrl.post.key).then(function success() {
                MessageService.showToast('Esse post foi removido dos posts de seu interesse.');
                _.remove(postCtrl.post.subscribers, function (userKey) {
                    return userKey === postCtrl.user.key;
                });
            }, function error(response) {
                $state.go($state.current);
            });
        };

        /**
         * Checks if the user is in the post's subscribers list
         */
        postCtrl.isSubscriber = function isSubscriber() {
            return postCtrl.post && postCtrl.post.subscribers.includes(postCtrl.user.key);
        };

        /**
         * If the post comes from another
         * it returns the shared one, otherwise
         * the post is returned.
         */
        function getOriginalPost() {
            if (postCtrl.post.shared_post) {
                return postCtrl.post.shared_post;
            } else if (postCtrl.post.shared_event) {
                return postCtrl.post.shared_event;
            }
            return postCtrl.post;
        }

        /**
         * Open up a dialog that allows the user to edit the post.
         */
        postCtrl.edit = function edit(event) {
            $mdDialog.show({
                controller: function DialogController() { },
                controllerAs: "controller",
                templateUrl: 'app/home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    originalPost: postCtrl.post,
                    isEditing: true
                },
                bindToController: true
            }).then(function success(editedPost) {
                postCtrl.post.title = editedPost.title;
                postCtrl.post.text = editedPost.text;
                postCtrl.post.photo_url = editedPost.photo_url;
                postCtrl.post.pdf_files = editedPost.pdf_files;
                postCtrl.post.video_url = editedPost.video_url;
            }, function error() { });
        };

        /**
         * Checks if the user can edit the post. For that, the user needs to have the
         * permissions. Besides, the post and the institution can not be unavailable
         */
        postCtrl.canEdit = function canEdit() {
            const hasPermission = postCtrl.post && postCtrl.user.hasPermission(EDIT_POST_PERMISSION, postCtrl.post.key);
            var isActiveInst = postCtrl.post && postCtrl.post.institution_state == "active";
            return hasPermission && postCtrl.post.state !== 'deleted' && isActiveInst &&
                !postCtrl.postHasActivity() && !postCtrl.isShared() && !postCtrl.post.type_survey;
        };

        /**
         * Checks if the post has any activity. It can be comments or likes.
         */
        postCtrl.postHasActivity = function postHasActivity() {
            var hasNoComments = postCtrl.post.number_of_comments === 0;
            var hasNoLikes = postCtrl.post.number_of_likes === 0;

            return !hasNoComments || !hasNoLikes;
        };

        /**
         * Checks if the post came from another post or event by sharing.
         */
        postCtrl.isShared = function isShared() {
            return postCtrl.post.shared_post ||
                postCtrl.post.shared_event;
        };

        /**
         * Constructs a list with the menu options.
         */
        postCtrl.generateToolbarOptions = function generateToolbarOptions() {
            postCtrl.defaultToolbarOptions = [
                { title: 'Obter link', icon: 'link', action: () => { postCtrl.copyLink() } },
                { title: 'Atualizar post', icon: 'refresh', action: () => { postCtrl.reloadPost() } },
                { title: 'Compartilhar', icon: 'share', action: () => { postCtrl.share('$event') } },
                { title: 'Receber atualizações', icon: 'bookmark', action: () => { postCtrl.addSubscriber() }, hide: () => postCtrl.isSubscriber() },
                { title: 'Não receber atualizações', icon: 'bookmark', 
                    action: () => { postCtrl.removeSubscriber() }, hide: () => !postCtrl.isSubscriber() || postCtrl.isPostAuthor() },
                { title: 'Editar postagem', icon: 'edit', action: () => { postCtrl.edit() }, hide: () => !postCtrl.canEdit() }
            ];
        };

        /**
         * Checks if the current user is the post's author.
         */
        postCtrl.isPostAuthor = function isPostAuthor() {
            return postCtrl.post.author_key === postCtrl.user.key;
        };

        function loadPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                postCtrl.post = response;
                postCtrl.post.data_comments = _.values(postCtrl.post.data_comments);
            }, function error() {
                $state.go(STATES.HOME);
            });
            return promise;
        }

        postCtrl.$onInit = () => {
            loadPost($state.params.key);
            postCtrl.generateToolbarOptions();
        }; 
    });
})();