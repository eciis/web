'use strict';

(function () {
    const app = angular.module("app");

    app.controller("SelectEmailsController", function SelectEmailsController($mdDialog, AuthService, MessageService) {
        var selectEmailsCtrl = this;

        selectEmailsCtrl.user = AuthService.getCurrentUser();
        selectEmailsCtrl.selectedEmails = [];

        var INVALID_INDEX = -1;
        var MAX_EMAILS_QUANTITY = 50;

        selectEmailsCtrl.select = function select(email) {
            var index = selectEmailsCtrl.selectedEmails.indexOf(email);
            var emailExists = index > INVALID_INDEX;
            if (emailExists) {
                selectEmailsCtrl.selectedEmails.splice(index, 1);
            } else if (!selectEmailsCtrl.validateEmail(email)) {
                MessageService.showToast("Não é possível selecionar esta opção. E-mail inválido.");
            } else {
                selectEmailsCtrl.selectedEmails.push(email);
            }
        };

        selectEmailsCtrl.exists = function exists(email) {
            return selectEmailsCtrl.selectedEmails.indexOf(email) !== -1;
        };

        selectEmailsCtrl.selectAllEmails = function selectAllEmails() {
            var filteredEmails = selectEmailsCtrl.emails.filter(email => selectEmailsCtrl.validateEmail(email));
            if (selectEmailsCtrl.emails && selectEmailsCtrl.selectedEmails.length === filteredEmails.length) {
                selectEmailsCtrl.selectedEmails = [];
            } else if (filteredEmails && selectEmailsCtrl.selectedEmails.length >= 0) {
                selectEmailsCtrl.selectedEmails = filteredEmails.slice(0);
            }
        };

        selectEmailsCtrl.isChecked = function isChecked() {
            if (selectEmailsCtrl.emails) {
                var filteredEmails = selectEmailsCtrl.emails.filter(email => selectEmailsCtrl.validateEmail(email));
                return selectEmailsCtrl.selectedEmails.length === filteredEmails.length;
            }
        };

        selectEmailsCtrl.closeDialog = function closeDialog() {
            $mdDialog.cancel();
        };

        selectEmailsCtrl.sendInvite = function sendInvite() {
            if (!_.isEmpty(selectEmailsCtrl.selectedEmails) && _.size(selectEmailsCtrl.selectedEmails) <= MAX_EMAILS_QUANTITY) {
                var emails = selectEmailsCtrl.removePendingAndMembersEmails(selectEmailsCtrl.selectedEmails)
                if (!_.isEmpty(emails)) {
                    selectEmailsCtrl.sendUserInvite(emails);
                } else {
                    MessageService.showToast("E-mails selecionados já foram convidados, requisitaram ser membro ou pertencem a algum membro da instituição.");
                }
                selectEmailsCtrl.closeDialog();
            } else if (selectEmailsCtrl.selectedEmails > MAX_EMAILS_QUANTITY) {
                MessageService.showToast("Limite máximo de " + MAX_EMAILS_QUANTITY + " e-mails selecionados excedido.");
            } else {
                MessageService.showToast("Pelo menos um e-mail deve ser selecionado.");
            }
        };

        selectEmailsCtrl.validateEmail = function validateEmail(email) {
            return Utils.validateEmail(email);
        }
    });
})();