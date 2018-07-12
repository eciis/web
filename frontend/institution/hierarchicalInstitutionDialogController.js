'use strict';

(function () {
    var app = angular.module("app");

    app.controller('HierarchicalInstitutionDialogController', function (institution, $mdDialog) {
        var hierCtrl = this;
        
        hierCtrl.institution = institution;

        hierCtrl.close = function close() {
            $mdDialog.cancel();
        };
    });
})();