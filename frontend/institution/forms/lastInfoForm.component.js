'use strict';

(function () {
  function controller() {
    const ctrl = this;

    ctrl.$onInit = () => {
      ctrl.configInstCtrl = ctrl.parentCtrl;
    }
  }

  const app = angular.module('app');
  app.component('lastInfoForm', {
    controller: controller,
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/last_info_form.html',
    bindings: {
      parentCtrl: '=',
    }
  });
})();
