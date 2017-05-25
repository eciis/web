(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $state, AuthService, PostService) {
        var mainCtrl = this;

        Object.defineProperty(mainCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.isActive = function isActive(inst) {
            if (mainCtrl.user.current_institution == inst) {
                return true;
            }
            return false;
        };

        mainCtrl.changeInstitution = function changeInstitution(name) {
            mainCtrl.user.changeInstitution(name);
        };

        mainCtrl.settings = [{
            name: 'Início',
            stateTo: 'app.home',
            icon: 'home',
            enabled: true
        }, {
            name: 'Nova Instituição',
            stateTo: 'app.institution',
            icon: 'account_balance',
            enabled: true
        }, {
            name: 'Novo Usuário',
            stateTo: 'user.new',
            icon: 'person_add',
            enabled: true
        }, ];

        mainCtrl.goTo = function goTo(state) {
            $state.go(state);
            mainCtrl.toggle();
        };

        mainCtrl.createPost = function createPost(data) {
            var post = new Post(data, mainCtrl.user.current_institution.key);
            if (post.isValid()) {
                PostService.createPost(post).then(function success(response) {
                    showToast('Postado com sucesso!');
                    mainCtrl.posts.push(response.data);
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Post inválido!');
            }
        };

        mainCtrl.newPost = function(event) {
            $mdDialog.show({
                controller: MainController,
                controllerAs: "mainCtrl",
                templateUrl: 'main/new_post.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            }).then(function(answer) {
                if (answer == 'send') {
                    var post = new Post(data, mainCtrl.user.current_institution.key);
                    if (post.isValid()) {
                        PostService.createPost(post).then(
                            function success(response) {
                                showToast('Postado com sucesso!');
                                mainCtrl.posts.push(response.data);
                            }, function error(response) {
                                showToast(response.data.msg);
                        });
                    } else {
                        showToast('Post inválido!');
                    }
                }
            });
        };

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