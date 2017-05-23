(function() {
    var app = angular.module("app");
    
    app.controller("LoginController", function LoginController() {
        var loginCtrl = this;

        loginCtrl.limpar = function limpar() {
            loginCtrl.user = {};
        };
    });
})();