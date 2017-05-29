(function() {
    var app = angular.module("app");

    app.controller("HomeController", function HomeController(PostService, AuthService, $interval, $mdToast, $mdDialog) {
        var homeCtrl = this;
        
        homeCtrl.posts = [];

        Object.defineProperty(homeCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        homeCtrl.deletePost = function deletePost(ev, post) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Post')
                .textContent('Este post será excluído e desaparecerá para os usuários que seguem a instituição.')
                .ariaLabel('Delete')
                .targetEvent(ev)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                PostService.deletePost(post).then(function success(response) {
                    _.remove(homeCtrl.posts, foundPost => foundPost.author_key === post.author_key);
                    showToast('Post excluído com sucesso');
                }, function error(response) {
                    showToast(response.data.msg);
                })
            }, function() {
                showToast('Cancelado');
            });
        };

        homeCtrl.isAuthor = function isAuthor(post) {
            if (post.author_key == homeCtrl.user.key 
                && _.find(homeCtrl.user.institutions, ['key', post.institution_key])) {
                return true;
            };
            return false;
        };

        var intervalPromise;

        var loadPosts = function() {
            PostService.get().then(function success(response) {
                homeCtrl.posts = response.data;
            }, function error(response) {
                $interval.cancel(intervalPromise); // Cancel the interval promise that load posts in case of error
                showToast(response.data.msg);
            });
        };

        loadPosts();

        intervalPromise = $interval(loadPosts, 5000);

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