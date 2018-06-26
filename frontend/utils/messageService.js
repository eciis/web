'use strict';

(function() {
    var app = angular.module("app");

    app.service("MessageService", function MessageService($mdToast, $mdDialog) {
        var service = this;

        var msg = {
            "auth/email-already-in-use": "Email informado já está cadastrado.",
            "auth/wrong-password": "Senha incorreta ou usuário não possui senha.",
            "auth/user-not-found": "Usuário não existe.",
            "Error! The user must be interested at his post": "O autor deve ser interessado em seu post.",
            "Error! The end time must be after the current time": "A data final do evento deve ser posterior a data atual!",
            "Error! The event basic data can not be changed after it has ended": "As informações básicas do evento não podem ser alteradas após sua data de termino!",
            "Error! The end time can not be before the start time": "A data final do evento deve ser posterior a inicial!",
            "Error! The invite has already been used": "Esse convite já foi utilizado!",
            "Error! This comment has been deleted.": "Esse comentário foi removido!",
            "Error! This post has been deleted": "Esse post foi removido.",
            "Error! User already liked this comment.": "O usuário já curtiu esse comentário.",
            "The invites are being processed.": "Os convites estão sendo processados.",
            "Error! This institution is not active.": "Essa instituição não está ativa.",
            "Error! Invalid Current Institution! User is not an active member.": "Usuário não é um membro ativo.",
            "Error! This invitation has already been processed": "Esse convite já foi processado.",
            "Error! Invitation type not allowed": "Tipo de convite não permitido.",
            "Error! The invitee is not a member of this institution!": "O convidado não é um membro dessa instituição.",
            "Error! The invitee is already admin of this institution!": "O convidado já é o administrador dessa instituição.",
            "Error! Sender is not admin of this institution!": "Você não é o administrador dessa instituição.",
            "Error! An invitation is already being processed for this institution!": "Um convite desse mesmo tipo já está sendo processado para essa instituição.",
            "Error! The sender is already a member": "O usuário já é um membro.",
            "Error! The sender is already invited": "O usuário já foi convidado para ser membro dessa instituição.",
            "Error! User is not allowed to send invites": "O usuário não tem permissão para enviar convites.",
            "Error! The event has been deleted.": "Esse evento foi removido.",
            "Error! User is not allowed to remove institution": "O usuário não tem permissão para remover essa instituição.",
            "Error! Circular hierarchy not allowed": "Não é permitido criar dependencia circular entre instituições.",
            "Error! The requested institution has already been invited": "Esta instituição já foi convidada, mas seu convite está pendente",
            "Error! You've already voted in this survey": "Você já votou nessa enquete",
            "Error! User is not allowed to edit this post": "O usuário não tem permissão para editar essa publicação.",
            "Error! This post cannot be updated": "A publicação não pode ser editada.",
            "Error! You don't have permission to publish post.": "Você não tem permissão para publicar post nesta instituição",
            "Error! The user can not remove this post": "Você não tem permissão para remover esse post"
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

        service.showMessageDialog = function (event, message) {

            function MessageController ($mdDialog) {
                const controll = this;
                controll.message = message;
    
                controll.hide = function hide() {
                    $mdDialog.hide();
                };
            }
        
            $mdDialog.show({
                templateUrl: "app/utils/message_dialog.html",
                controller: MessageController,
                controllerAs: 'ctrl',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true
            });
        }
    });
})();