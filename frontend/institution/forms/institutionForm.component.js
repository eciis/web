'use strict';

(function () {
  function InstitutionFormController(CropImageService, ImageService, MessageService, $scope, InstitutionService) {
    const ctrl = this;
    ctrl.institution = {};
    ctrl.pictureFile = {};
    ctrl.actuationAreas = {};
    ctrl.legalNatures = {};
    ctrl.numberRegex = /\d+$/
    ctrl.phoneRegex = /\d{2}\s\d{4,5}\-\d{4,5}/

    ctrl.cropThenSetImage = (event) => {
      CropImageService.crop(ctrl.pictureFile, event).then((cropped) => {
        const size = 800;
        ImageService.compress(cropped, size).then((resized) => {
          ctrl.onNewPhoto({photoSrc: resized});
          ImageService.readFile(resized, (img) => {
            ctrl.institution.photo_url = img.src;
            ctrl.pictureFile = null;
            $scope.$apply();
          });
        });
      }).catch(e => {
        MessageService.showToast(e);
        ctrl.pictureFile = null;
      });
    }

    ctrl.$onInit = () => {
      InstitutionService.getLegalNatures().then(res => {
        ctrl.legalNatures = res;
      });
      InstitutionService.getActuationAreas().then(res => {
        ctrl.actuationAreas = res;
      });
    }
  }

  const app = angular.module('app');
  app.component('institutionForm', {
    controller: InstitutionFormController,
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/institution_form.html',
    bindings: {
      institution: '=',
      onNewPhoto: '&',
    }
  });
})();
