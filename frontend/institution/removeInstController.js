'use strict';

(function () {
    const app = angular.module("app");

    app.controller("RemoveInstController", function RemoveInstController($mdDialog, institution,
        InstitutionService, $state, AuthService, MessageService, STATES) {
        var removeInstCtrl = this;

        removeInstCtrl.institution = institution;
        removeInstCtrl.user = AuthService.getCurrentUser();

        removeInstCtrl.closeDialog = function () {
            $mdDialog.cancel();
        };

        removeInstCtrl.removeInst = function removeInst() {
            InstitutionService.removeInstitution(institution.key, removeInstCtrl.removeHierarchy).then(function success() {
                removeInstCtrl.user.removeProfile(institution.key, removeInstCtrl.removeHierarchy);
                removeInstCtrl.user.removeInstitution(institution.key, removeInstCtrl.removeHierarchy);
                AuthService.save();
                removeInstCtrl.closeDialog();
                if (_.isEmpty(removeInstCtrl.user.institutions)) {
                    AuthService.logout();
                } else {
                    $state.go(STATES.HOME);
                }
                MessageService.showToast("Instituição removida com sucesso.");
            });
        };

        removeInstCtrl.hasOneInstitution = function hasOneInstitution() {
            return _.size(removeInstCtrl.user.institutions) === 1;
        };

        removeInstCtrl.thereIsNoChild = function thereIsNoChild() {
            return _.isEmpty(institution.children_institutions);
        };
        
        removeInstCtrl.goToInstitution = () => {
            $state.go('app.institution.timeline', { institutionKey: removeInstCtrl.institution.key});
            removeInstCtrl.closeDialog();
        };
        
        removeInstCtrl.getTitle = () => {
            return removeInstCtrl.hasOneInstitution() ? 
                "Ao remover essa instituição você perderá o acesso a plataforma. Deseja remover?" : "Deseja remover esta instituição permanentemente ?";
        };
    });
})();