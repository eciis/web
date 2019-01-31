'use strict';

(function () {

    const app = angular.module("app");

    app.controller("EditRegistrationDataController", ["InstitutionService",
        "MessageService", "institution", "$mdDialog", function EditRegistrationDataController(InstitutionService,
        MessageService, institution, $mdDialog) {

        const editInfoCtrl = this;

        editInfoCtrl.closeDialog = () => $mdDialog.cancel();

        function getLegalNature() {
            InstitutionService.getLegalNatures().then(function success(response) {
                editInfoCtrl.instLegalNature = _.get(response, 
                    editInfoCtrl.institution.legal_nature);
                editInfoCtrl.legalNatures = response;
            });
        };

        function getActuationArea() {
            InstitutionService.getActuationAreas().then(function success(response) {
                editInfoCtrl.instActuationArea = _.get(response, 
                    editInfoCtrl.institution.actuation_area);
                editInfoCtrl.actuationAreas = response;
            });
        };

        editInfoCtrl.$onInit = () => {
            getLegalNature();
            getActuationArea();
        };
    }]);

})();