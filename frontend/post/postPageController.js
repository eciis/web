(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController(PostService, $state, MessageService) {
        var postCtrl = this;

        postCtrl.post = null;

        postCtrl.isDeletedPost = function isDeletedPost() {
            return postCtrl.post.state == 'deleted' && postCtrl.post.number_of_comments === 0;
        };

        function loadPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                postCtrl.post = response;
                postCtrl.post.data_comments = _.values(postCtrl.post.data_comments);
            }, function error(response) {
                if (response.status === 500) {
                    MessageService.showToast(response.data.msg);
                }
                $state.go("app.home");
            });
            return promise;
        }

        loadPost($state.params.key);
    });
})();