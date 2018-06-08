(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController(PostService, $state, MessageService) {
        var postCtrl = this;

        postCtrl.post = null;

        postCtrl.isHiden = function isHiden() {
            var isDeleted = postCtrl.post.state == 'deleted';
            var hasNoComments = postCtrl.post.number_of_comments === 0;
            var hasNoLikes = postCtrl.post.number_of_likes === 0;
            var hasNoActivity = hasNoComments && hasNoLikes;

            return postCtrl.post.state === 'deleted' && hasNoActivity;
        };

        function loadPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                postCtrl.post = response;
                postCtrl.post.data_comments = _.values(postCtrl.post.data_comments);
            }, function error() {
                $state.go("app.user.home");
            });
            return promise;
        }

        loadPost($state.params.key);
    });
})();