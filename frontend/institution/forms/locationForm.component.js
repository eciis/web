'use strict';

(function () {
  function controller() {
    const ctrl = this;

    ctrl.$onInit = () => {
      ctrl.configInstCtrl = ctrl.parentCtrl;
    }
  }

  const app = angular.module('app');
  app.component('locationForm', {
    controller: controller,
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/location_form.html',
    bindings: {
      parentCtrl: '=',
    }
  });
})();
