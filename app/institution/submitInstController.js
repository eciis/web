'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, $state, $mdToast, $mdDialog) {
        var submitInstCtrl = this;

        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        submitInstCtrl.invite = {
            invitee: "reponsavel@email.com",
            suggestion_institution_name: "Nome sugerido"
        };
        submitInstCtrl.institution = {
            name: submitInstCtrl.invite.suggestion_institution_name,
            adminName: "nome do reponsavel",
            sigla: "",
            cnpj: "",
            legalNature: "",
            address: "",
            occupationArea: "",
            otherArea: "",
            description: "",
            imageUrl: "",
            email: submitInstCtrl.invite.invitee,
            phoneNumber: "",
            admin: "",
            state: "active"
        };
        submitInstCtrl.natures = [
            {value:"public", name:"Pública"}, 
            {value:"private", name:"Privada"},
            {value:"philanthropic", name:"Filantrópica"}
        ];
        submitInstCtrl.areas = [
            {value:"official laboratories", name:"Laboratórios Oficiais"}, 
            {value:"government agencies", name:"Ministérios e outros Órgãos do Governo"}, 
            {value:"funding agencies", name:"Agências de Fomento"}, 
            {value:"research institutes", name:"Institutos de Pesquisa"}, 
            {value:"colleges", name:"Universidades"},
            {value:"other", name:"Outra"}
        ];
        submitInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        submitInstCtrl.phoneRegex = "([0-9]{2}[\\s][0-9]{8})";

        submitInstCtrl.submit = function submit() {
            var confirm = $mdDialog.confirm(event)
                .clickOutsideToClose(true)
                .title('Confirmar Cadastro')
                .textContent('Confirmar o cadastro dessa instituição?')
                .ariaLabel('Confirmar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            $mdDialog.show(confirm).then(function() {
                goHome();            
                showToast('Cadastro de instituição realizado com sucesso');
            }, function() {
                showToast('Cancelado');
            });
        };

        submitInstCtrl.cancel = function cancel(event) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Cancelar Cadastro')
                .textContent('Cancelar o cadastro dessa instituição?')
                .ariaLabel('Cancelar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            $mdDialog.show(confirm).then(function() {
                goHome();            
                showToast('Cadastro de instituição cancelado');
            }, function() {
                showToast('Cancelado');
            });
        };

         var goHome = function goToHome() {
            $state.go('app.home');
        };

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }
    });
})();
