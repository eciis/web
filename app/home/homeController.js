(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService) {
        var homeCtrl = this;
        homeCtrl.posts = [];

        Object.defineProperty(homeCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        homeCtrl.createdAt = function(post) {
            if (post) {
                post.created_at = new Date();
            }
        };

        /** TODO 
            Autor: Mayza Nunes 18/05/2016
            Error treatment
        **/
        var loadPosts = function() {
            PostService.get().then(function(response) {
                homeCtrl.posts = response.data;
            });
        };

        /** TODO 
            Autor: Mayza Nunes 18/05/2016
            Error treatment
        **/
        homeCtrl.post = function(post) {
            PostService.post(post);
        };

        loadPosts();
    });
})();