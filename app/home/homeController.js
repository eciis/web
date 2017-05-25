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
                setLikedAttr(homeCtrl.posts);
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        homeCtrl.likePost = function(post) {

            PostService.likePost(post).then(function success(response) {
                post.likes += 1;
                post.liked = !post.liked;
            }, function error(response) {
                showToast(response.data.msg);
            });
        };

        // TODO: create method to dislike

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

        function setLikedAttr(posts) {
            _.map(posts, function(post) {
                _.assign(post, {liked: false});
            });
        };
    });
})();