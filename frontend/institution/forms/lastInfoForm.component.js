'use strict';

(function () {
  function LastInfoController() {
  }

  const app = angular.module('app');
  app.component('lastInfoForm', {
    controller: [LastInfoController],
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/last_info_form.html',
    bindings: {
      institution: '=',
    }
  });
})();
