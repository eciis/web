(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService, $interval, $mdToast) {
        var homeCtrl = this;
        
        homeCtrl.posts = [];

        Object.defineProperty(homeCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        homeCtrl.createPost = function createPost(data) {
            var post = new Post(data, homeCtrl.user.current_institution.key);
            if (post.isValid()) {
                PostService.createPost(post).then(function success(response) {
                    showToast('Postado com sucesso!');
                    homeCtrl.posts.push(response.data);
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Post inválido!');
            }
        };

        var loadPosts = function() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        homeCtrl.likePost = function(post) {
            PostService.likePost(post).then(function success(response) {
                addPostKeyToUser(post.key);
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        homeCtrl.isLikedByUser = function isLikedByUser(post) {
            var likedPosts = homeCtrl.user ? homeCtrl.user.liked_posts : [];
            var likedPostsKeys = _.map(likedPosts, getKeyFromUrl);
            return _.includes(likedPostsKeys, post.key);
        };

        function addPostKeyToUser(key) {
            homeCtrl.user.liked_posts.push("http://localhost:8080/api/key/" + key);
        };

        function getKeyFromUrl(url) {
            var splitedUrl = url.split("http://localhost:8080/api/key/");
            var key = splitedUrl[1];
            return key;
        };

        loadPosts();

        $interval(loadPosts, 5000);

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        };
    });
})();