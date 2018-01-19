(function () {
    'use strict';

    var support = angular.module("support");

    support.controller("ReportController", function ReportController($state, MessageService) {
        var controller = this;

        controller.report = {};

        controller.isValid = function isValid(formInvalid) {
            return controller.report.title && controller.report.description && !formInvalid;
        };

        controller.sendReport = function sendReport() {
            console.log(controller.report);
            MessageService.showToast("Obrigado! Recebemos seu Relatório.");
            $state.go("support.home");
        };
    });
})();