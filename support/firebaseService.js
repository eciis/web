(function () {
    var support = angular.module('support');

    support.service('FirebaseService', function ($firebaseArray, AuthService) {
        var service = this;

        var firebaseRef = firebase.database().ref();
        
        var reportsArray;

        service.getReports = function getReports() {
            return reportsArray.$loaded();
        };

        service.createReport = function createReport(report) {
            return reportsArray.$add(report);
        };

        AuthService.$onLogout(function destroy() {
            reportsArray.$destroy();
            reportsArray = undefined;
        });

        service.setup = function setup() {
            var reportsRef = firebaseRef.child("reports/"+AuthService.getCurrentUser().uid);
            reportsArray = $firebaseArray(reportsRef);
        };
    });
})();