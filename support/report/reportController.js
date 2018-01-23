(function () {
    'use strict';

    var support = angular.module("support");

    support.controller("ReportController", function ReportController($state, MessageService, FirebaseService) {
        var controller = this;

        controller.report = {};

        controller.isValid = function isValid(formInvalid) {
            return controller.report.title && controller.report.description && !formInvalid;
        };

        controller.sendReport = function sendReport() {
            FirebaseService.addReport(controller.report).then(function() {
                MessageService.showToast("Obrigado! Recebemos seu Relatório.");
                $state.go("support.home");
            });
        };
    });
})();