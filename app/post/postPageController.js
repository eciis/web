(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController($mdDialog, PostService, AuthService, $mdToast, $state, MessageService) {
        var postCtrl = this;

        postCtrl.post = null;

        function getPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                postCtrl.post = response;
            }, function error(response) {
                MessageService.showToast(response.msg);
            });
            return promise;
        }

        
        getPost($state.params.postKey);
        
    });
})();