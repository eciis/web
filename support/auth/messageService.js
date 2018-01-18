(function() {
    'use strict';

    var support = angular.module("support");

    support.service("MessageService", function MessageService($mdToast, $mdDialog) {
        var service = this;

        var msg = {
            "auth/email-already-in-use": "Email informado já está cadastrado.",
            "auth/wrong-password": "Senha incorreta ou usuário não possui senha.",
            "auth/user-not-found": "Usuário não existe.",
            "Error! The institution has been deleted": "A instituição está inativa.",
            "Error! The user must be interested at his post": "O autor deve ser interessado em seu post.",
            "Error! The end time must be after the current time": "A data final do evento deve ser posterior a data atual!",
            "Error! The end time can not be before the start time": "A data final do evento deve ser posterior a inicial!"
        };

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
            return msg[message.code] || msg[message] || message;
        }

        service.showConfirmationDialog = function showConfirmationDialog(event, title, textContent) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title(title)
                .textContent(textContent)
                .ariaLabel(title)
                .targetEvent(event)
                .ok('Ok')
                .cancel('Cancelar');

            return $mdDialog.show(confirm);
        };
    });
})();