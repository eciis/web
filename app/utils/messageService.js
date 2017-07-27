'use strict';

(function() {
    var app = angular.module("app");

    app.service("MessageService", function MessageService($mdToast) {
        var service = this;

        service.showToast = function showToast(message) {
            message = customMessage(message);
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        };

        function customMessage(message) {
            if (message.code && message.code === "auth/email-already-in-use") {
                return "Email informado já está cadastrado.";
            }
            if (message.code && message.code === "auth/wrong-password") {
                return "Senha incorreta ou usuário não possui senha.";
            }
            if (message.code && message.code === "auth/user-not-found") {
                return "Usuário não existe.";
            }
            return message;
        }
    });
})();