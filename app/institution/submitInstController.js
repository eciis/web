'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog) {
        var submitInstCtrl = this;

        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
            set: function set(newValue) {
                AuthService.user = newValue;
            }
        });

        submitInstCtrl.user = {
            name: "Ruan Silveira",
            key: "ahdkZXZ-aGVsbG8td29ybGQtYnktcnVhbnIRCxIEVXNlchiAgICAgMDfCQw",
            invites: [{
                "key": "ahdkZXZ-aGVsbG8td29ybGQtYnktcnVhbnITCxIGSW52aXRlGICAgICAoOAKDA",
                "suggestion_institution_name": "New Institution",
                "type_of_invite": "institution",
                "status": "sent",
                "invitee": "ruan.silveira@ccc.ufcg.edu.br"
            }]
        };

        submitInstCtrl.invite = submitInstCtrl.user.invites[0];

        submitInstCtrl.institution = {
            name: submitInstCtrl.invite.suggestion_institution_name,
            acronym: "",
            cnpj: "",
            legal_nature: "",
            address: "",
            occupation_area: "",
            other_area: "",
            description: "",
            phone_number: "",
            image_url: "",
            email: submitInstCtrl.invite.invitee,
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
                console.log(InstitutionService);
                InstitutionService.createInstitution(submitInstCtrl.institution).then(function success(response) {
                    goHome();            
                    showToast('Cadastro de instituição realizado com sucesso');
                }, function error(response) {
                    showToast(response.data.msg);
                });
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
