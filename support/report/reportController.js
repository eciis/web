(function () {
    'use strict';

    var support = angular.module("support");

    support.controller("ReportController", function ReportController($state, MessageService, $firebaseArray) {
        var controller = this;

        controller.report = {};

        var ref = firebase.database().ref();

        controller.isValid = function isValid(formInvalid) {
            return controller.report.title && controller.report.description && !formInvalid;
        };

        controller.sendReport = function sendReport() {
            console.log(controller.report);

            var reportsRef = ref.child("reports/");
            var firebaseArrayReport = $firebaseArray(reportsRef);
            firebaseArrayReport.$loaded().then(function () {
                firebaseArrayReport.$add(controller.report);
            });


            MessageService.showToast("Obrigado! Recebemos seu Relatório.");
            $state.go("support.home");
        };
    });
})();