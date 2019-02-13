'use strict';

(function () {
  const app = angular.module("app");

  app.component("defaultToolbar", {
    templateUrl: 'app/toolbar/default_toolbar_mobile.html',
    controller: ['$mdSidenav', 'STATES', '$state', 'SCREEN_SIZES', 
        '$timeout', DefaultToolbarController],
    controllerAs: 'defaultToolbarCtrl',
    bindings: {}
  });

  function DefaultToolbarController() {
    const defaultToolbarCtrl = this;
  }
})();