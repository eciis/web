(function() {
    var app = angular.module("app");
    
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