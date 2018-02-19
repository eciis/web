(function () {
    'use strict';

    var support = angular.module("support");

    support.controller("ReportHomeController", function ReportHomeController($state, FirebaseService, $mdDialog) {
        var controller = this;

        controller.reports = [];

        controller.selectedReport = null;

        controller.loading = true;

        controller.showReport = function showReport(report, event) {
            controller.selectedReport = report;
            $mdDialog.show({
                contentElement: '#showReport',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            });
        };

        controller.cancelDialog = function cancelDialog() {
            $mdDialog.cancel();
        };

        (function main() {
            FirebaseService.getReports().then(function (reports) {
                controller.reports = reports;
                controller.loading = false;
            });
        })();
    });
})();