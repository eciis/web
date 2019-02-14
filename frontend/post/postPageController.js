(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController(PostService, $state, 
        STATES, MessageService, ngClipboard, AuthService, $mdDialog) {
        var postCtrl = this;

        postCtrl.post = null;

        postCtrl.defaultToolbarOptions = generateToolbarOptions();

        postCtrl.user = AuthService.getCurrentUser();

        postCtrl.isHiden = function isHiden() {
            var isDeleted = postCtrl.post.state == 'deleted';
            var hasNoComments = postCtrl.post.number_of_comments === 0;
            var hasNoLikes = postCtrl.post.number_of_likes === 0;
            var hasNoActivity = hasNoComments && hasNoLikes;

            return postCtrl.post.state === 'deleted' && hasNoActivity;
        };

        postCtrl.copyLink = function copyLink() {
            var url = Utils.generateLink('/post/' + postCtrl.post.key);
            ngClipboard.toClipboard(url);
            MessageService.showToast("O link foi copiado");
        };

        postCtrl.reloadPost = function reloadPost() {
            var type_survey = postCtrl.post.type_survey;
            postCtrl.post.type_survey = '';
            var promise = PostService.getPost(postCtrl.post.key);
            promise.then(function success(response) {
                response.data_comments = Object.values(response.data_comments);
                postCtrl.post = response;
                postCtrl.isLoadingComments = false;
            }, function error(response) {
                postCtrl.post.type_survey = type_survey;
                postCtrl.isLoadingComments = true;
            });
            return promise;
        };

        postCtrl.share = function share(event) {
            const post = getOriginalPost(postCtrl.post);
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

        postCtrl.addSubscriber = function addSubscriber() {
            PostService.addSubscriber(postCtrl.post.key).then(function success() {
                MessageService.showToast('Esse post foi marcado como de seu interesse.');
                postCtrl.post.subscribers.push(postCtrl.user.key);
            });
        };

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

        postCtrl.isSubscriber = function isSubscriber() {
            return postCtrl.post && _.includes(postCtrl.post.subscribers, postCtrl.user.key);
        };

        function getOriginalPost(post) {
            if (post.shared_post) {
                return post.shared_post;
            } else if (post.shared_event) {
                return post.shared_event;
            }
            return post;
        }

        function generateToolbarOptions() {
            return [
                { title: 'Obter link', icon: 'link', action: () => { postCtrl.copyLink() } },
                { title: 'Atualizar post', icon: 'refresh', action: () => { postCtrl.reloadPost() } },
                { title: 'Compartilhar', icon: 'share', action: () => { postCtrl.share('$event') } },
                { title: 'Receber atualizações', icon: 'bookmark', action: () => { postCtrl.addSubscriber() }, hide: () => postCtrl.isSubscriber() },
                { title: 'Não receber atualizações', icon: 'bookmark', 
                    action: () => { postCtrl.removeSubscriber() }, hide: () => !postCtrl.isSubscriber() }
            ];
        }

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

        loadPost($state.params.key);
    });
})();