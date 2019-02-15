'use strict';

(function () {
  function controller() {
    const ctrl = this;

    ctrl.$onInit = () => {
      ctrl.configInstCtrl = ctrl.parentCtrl;
    }
  }

  const app = angular.module('app');
  app.component('institutionForm', {
    controller: controller,
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/institution_form.html',
    bindings: {
      parentCtrl: '=',
    }
  });
})();
