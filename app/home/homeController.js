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

        var loadPosts = function() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
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
        }
    });
})();