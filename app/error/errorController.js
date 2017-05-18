var app = angular.module("app");

app.controller("ErrorController", function ErrorController($state) {
    var errorCtrl = this;

    errorCtrl.msg = $state.current.data.msg;
    errorCtrl.status = $state.current.data.status;
});