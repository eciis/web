'use strict';

(function() {
    const app = angular.module("webchat");

    app.service("MessageService", ['$mdToast', '$mdDialog', function MessageService($mdToast, $mdDialog) {
        const service = this;

        const msg = {
            "auth/wrong-password": "Senha incorreta ou usuário não possui senha.",
            "auth/user-not-found": "Usuário não existe.",
            "Error! Invalid Current Institution! User is not an active member.": "Usuário não é um membro ativo.",
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

        service.showConfirmationDialog = function showConfirmationDialog(event, params) {
            const dialog = {
                templateUrl: "app/utils/confirm_dialog.html",
                controller: dialogController,
                controllerAs: 'dialogCtrl',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: params,
            };

            return $mdDialog.show(dialog);
        };

        function dialogController (locals) {
            const dialogCtrl = this;

            dialogCtrl.$onInit = () => {
                _.assign(dialogCtrl, locals);
                _.defaults(dialogCtrl, {
                    confirmAction: () => {},
                    cancelText: "Cancelar",
                    confirmText: "Confirmar",
                });
            };

            dialogCtrl.cancelDialog = $mdDialog.cancel;

            dialogCtrl.confirmDialog = () => {
                dialogCtrl.confirmAction();
                $mdDialog.hide();
            };
        }

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
    }]);
})();
