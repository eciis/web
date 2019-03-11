(function() {
    'use strict';
    const app = angular.module('app');

    app.component('sharedPost', {
        templateUrl: 'app/post/shared_post_mobile.html',
        controller: 'PostDetailsController',
        controllerAs: 'postDetailsCtrl',
        bindings: {
            post: '<'
        }
    });
})();