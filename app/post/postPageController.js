(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("PostPageController", function PostPageController($mdDialog, PostService, AuthService, $mdToast, $state, MessageService) {
        var postCtrl = this;

        postCtrl.post = null;

        function getPost(postKey) {
            var promise = PostService.getPost(postKey);
            promise.then(function success(response) {
                console.log(response);
                postCtrl.post = response;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        (function main() {
            getPost($state.params.postKey);
        })();
    });
})();