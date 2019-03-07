(function () {
    'use strict';

    /**
     * An generical dialog component that has a title, a subtitle, a cancel button
     * and a confirm button. It receives as a binding the title, the subtitle and
     * the confirm action.
     * @class genDialog
     * @example
     * <md-dialog>
     *     <gen-dialog title="anTitle" subtitle="anSubtitle" confirm-action="anAction">
     *         <h1>The dialog content</h1>
     *         <p>It could be any HTML</p>
     *         <gen-component>Including a component</gen-component>
     *     </gen-dialog>
     * </md-dialog>
     */
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
            cancelText: "@",
            confirmText: "@",
        },
        transclude: true,
    });

    function dialogController($mdDialog) {
        const dialogCtrl = this;

        dialogCtrl.$onInit = () => {
            _.defaults(dialogCtrl, {
                confirmAction: () => {},
                cancelText: "Cancelar",
                confirmText: "Confirmar",
            });
        };

        dialogCtrl.cancelDialog = $mdDialog.cancel;
        dialogCtrl.confirmDialog = () => {
            dialogCtrl.confirmAction();
            $mdDialog.hide();
        };
    }

})();