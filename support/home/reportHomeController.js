(function() {
    'use strict';
    
    var support = angular.module("support");

    support.controller("ReportHomeController", function ReportHomeController($state, FirebaseService) {
        var controller = this;

        controller.reports = [];
        
        (function main() {
            FirebaseService.getReports().then(function (reports) {
                controller.reports = reports;
            });
        })();
    });
})();