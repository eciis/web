(function() {
    'use strict';
    const app = angular.module('app');

    app.component('sharedPost', {
        templateUrl: Utils.selectFieldBasedOnScreenSize('app/post/shared_post_desktop.html', 'app/post/shared_post_mobile.html', 600),
        controller: 'PostDetailsController',
        controllerAs: 'postDetailsCtrl',
        bindings: {
            post: '<'
        }
    });
})();