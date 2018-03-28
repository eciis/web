'use strict';

(function() {
    var app = angular.module("app");

    app.service("MessageService", function MessageService($mdToast, $mdDialog) {
        var service = this;

        var msg = {
            "auth/email-already-in-use": "Email informado já está cadastrado.",
            "auth/wrong-password": "Senha incorreta ou usuário não possui senha.",
            "auth/user-not-found": "Usuário não existe.",
            "Error! The institution has been deleted": "A instituição está inativa.",
            "Error! The user must be interested at his post": "O autor deve ser interessado em seu post.",
            "Error! The end time must be after the current time": "A data final do evento deve ser posterior a data atual!",
            "Error! The end time can not be before the start time": "A data final do evento deve ser posterior a inicial!",
            "Error! The invite has already been used": "Esse convite já foi utilizado!",
            "Error! This comment has been deleted.": "Esse comentário foi removido!",
            "Error! This post has been deleted": "Esse post foi removido.",
            "Error! User already liked this comment.": "O usuário já curtiu esse comentário.",
            "The invites are being processed.": "Os convites estão sendo processados.",
            "Error! The institution is not active.": "Essa instituição não está ativa.",
            "Error! Invalid Current Institution! User is not an active member.": "Usuário não é um membro ativo.",
            "Error! This invitation has already been processed": "Esse convite já foi processado.",
            "Error! Invitation type not allowed": "Tipo de convite não permitido.",
            "Error! The invitee is not a member of this institution!": "O convidado não é um membro dessa instituição.",
            "Error! The invitee is already admin of this institution!": "O convidado já é o administrador dessa instituição.",
            "Error! Sender is not admin of this institution!": "Você não é o administrador dessa instituição.",
            "Error! An invitation is already being processed for this institution!": "Um convite desse mesmo tipo já está sendo processado para essa instituição.",
            "Error! The sender is already a member": "O usuário já é um membro.",
            "Error! The sender is already invited": "O usuário já foi convidado para ser membro dessa instituição."
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
            return (message && msg[message.code]) || msg[message] || message;
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