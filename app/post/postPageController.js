(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController(PostService, $state, MessageService) {
        var postCtrl = this;

        postCtrl.post = null;

        function loadPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                postCtrl.post = response;
            }, function error(response) {
                MessageService.showToast(response.msg);
            });
            return promise;
        }

        loadPost($state.params.postKey);     
    });
})();