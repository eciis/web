(function () {
    var support = angular.module('support');

    support.service('FirebaseService', function ($firebaseArray) {
        var service = this;

        var firebaseRef = firebase.database().ref();
        var reportsRef = firebaseRef.child("reports/");
        var reportsArray = $firebaseArray(reportsRef);

        service.getReports = function getReports() {
            return reportsArray.$loaded();
        };

        service.createReport = function createReport(report) {
            return reportsArray.$add(report);
        };
    });
})();