(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $state, AuthService) {
        var mainCtrl = this;

        Object.defineProperty(mainCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
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
    });

    app.controller("HomeController", function HomeController(InstitutionService, $mdDialog, AuthService) {
        var homeCtrl = this;

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

        homeCtrl.posts = [{
            title: "Dolor sit amet",
            headerImage: "https://workingatbooking.com/content/uploads/2017/04/womenintech_heroimage.jpg",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent maximus id est in dapibus. Fusce lorem libero, vulputate quis purus maximus, auctor tempus enim. Sed."
        }, {
            title: "Country In Focus: France",
            headerImage: "https://media.licdn.com/media-proxy/ext?w=800&h=800&f=n&hash=To7i1hFKBL9I2Pgh63NelreR%2Bes%3D&ora=1%2CaFBCTXdkRmpGL2lvQUFBPQ%2CxAVta9Er0Vinkhwfjw8177yE41y87UNCVordEGXyD3u0qYrdfyO6eJPZcbGiuVwTcC8clAA0dvL5Q2LkD5HqI4_uLN942pXhLI27dA4BYBI3iSdf4tY",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur convallis rutrum scelerisque. Aenean a ultricies sem. Quisque feugiat lorem id neque iaculis commodo. Suspendisse aliquam."
        }, {
            title: "Curabitur sollicitudin",
            text: "Curabitur sollicitudin velit massa, quis lobortis lectus iaculis in. Integer leo urna, eleifend quis ultricies a, aliquam in nisi. In varius, neque pretium faucibus luctus."
        }, {
            title: "Integer efficitur faucibus est",
            text: "Integer efficitur faucibus est, porttitor faucibus lorem sagittis a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce quis mi."
        }, {
            title: "Suspendisse erat arcu",
            text: "Suspendisse erat arcu, pellentesque non bibendum a, viverra sed magna. Suspendisse potenti. In hac habitasse platea dictumst. Suspendisse accumsan, tellus quis sagittis tempus, sem ligula."
        }, {
            title: "Fusce ullamcorper elit eget",
            text: "Fusce ullamcorper elit eget convallis porttitor. In sit amet ultrices metus, a lacinia lacus. Maecenas velit magna, congue id tempor vitae, luctus vitae quam. Pellentesque."
        }, {
            title: "Duis consequat eu sem quis fermentum",
            text: "Duis consequat eu sem quis fermentum. Duis varius condimentum sodales. Ut id nibh sed magna semper tincidunt vitae eget justo. Suspendisse nibh risus, ornare at."
        }, {
            title: "Ut augue nulla",
            text: "Ut augue nulla, accumsan ac lobortis in, maximus ac eros. Duis in mattis lacus. Maecenas ut molestie leo, non consectetur ante. Integer elit est, convallis"
        }, {
            title: "Fusce interdum non magna congue dapibus",
            text: "Fusce interdum non magna congue dapibus. Aliquam ullamcorper orci nisl, ac ornare mi aliquam sed. Nunc sit amet elit id erat scelerisque mattis. Ut suscipit."
        }]
    });

    app.controller("NewInstitutionController", function NewInstitutionController() {
        var newInstCtrl = this;
    });

    app.controller("LoginController", function LoginController(AuthService) {
        var loginCtrl = this;

        loginCtrl.limpar = function limpar() {
            loginCtrl.user = {};
        };

        loginCtrl.login = function login() {
            console.log(url)
        };
    });
})();