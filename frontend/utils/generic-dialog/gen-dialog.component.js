(function () {
    'use strict';

    angular.module("app").component("genDialog", {
        templateUrl: "app/utils/generic-dialog/gen-dialog.html",
        controller: [
            '$mdDialog',
            dialogController,
        ],
        controllerAs: "dialogCtrl",
        bindings: {
            title: "@",
            subtitle: "@",
            confirmAction: "<",
        },
        transclude: true,
    });

    function dialogController($mdDialog) {
        const dialogCtrl = this;

        dialogCtrl.$onInit = () => {
            _.defaults(dialogCtrl, {
                confirmAction: () => {},
            });
        };

        dialogCtrl.cancelDialog = $mdDialog.cancel;
    }

})();