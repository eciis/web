'use strict';

(function() {
    var app = angular.module('app');

    app.controller("RemoveChildController", function RemoveChildController(
        $mdDialog, InstitutionService, AuthService, MessageService, child, parent) {

        var removeChildCtrl = this;
        var removeHierarchy = "false";
        removeChildCtrl.justification = "";
        removeChildCtrl.user = AuthService.getCurrentUser();

        removeChildCtrl.closeDialog = function closeDialog() {
            $mdDialog.cancel();
        };

        function removeChildFromParent() {
            _.remove(parent.children_institutions, function(institution) {
                return child.key === institution.key;
            });
        }

        removeChildCtrl.removeChildInst = function removeChildInst() {
            InstitutionService.removeInstitution(child.key, removeHierarchy, removeChildCtrl.justification).then(
                function success() {
                    removeChildCtrl.user.removeProfile(child.key, removeHierarchy);
                    removeChildCtrl.user.removeInstitution(child.key, removeHierarchy);
                    AuthService.save();
                    removeChildFromParent();
                    removeChildCtrl.closeDialog();
                    MessageService.showInfoToast("Instituição removida com sucesso.");
                });
        };
    });

})()