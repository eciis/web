'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService) {
        var submitInstCtrl = this;

        submitInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";

        submitInstCtrl.invite = {
            invitee: "reponsavel",
             suggestion_institution_name: "Nome sugerido"
        };

        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        submitInstCtrl.institution = {
            name: submitInstCtrl.invite.suggestion_institution_name,
            sigla: "",
            cnpj: "",
            legalNature: "",
            address: "",
            occupationArea: "",
            description: "",
            imageUrl: "",
            email: "",
            phoneNumber: "",
            admin: "",
            parentInstitution: "",
            state: "active"
        };
    });
})();
