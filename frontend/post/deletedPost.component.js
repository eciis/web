(function () {
    'use strict';
    function deletedPostController() {
    }

    const app = angular.module('app');
    app.component('deletedPost', {
        controller: deletedPostController,
        templateUrl: 'app/post/deleted_post.html',
        bindings: {
            post: '=',
            message: '@'
        }
    });
})();