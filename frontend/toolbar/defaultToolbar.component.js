'use strict';

(function () {
  const app = angular.module("app");

  app.component("defaultToolbar", {
    templateUrl: 'app/toolbar/default_toolbar_mobile.html',
    controller: ['SCREEN_SIZES', '$window', DefaultToolbarController],
    controllerAs: 'defaultToolbarCtrl',
    bindings: {
      menuOptions: '='
    }
  });

  function DefaultToolbarController(SCREEN_SIZES, $window) {
    const defaultToolbarCtrl = this;

    /**
     * Returns true if the application is being used by a mobile
     */
    defaultToolbarCtrl.isMobileScreen = () => {
      return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
    };
    
    defaultToolbarCtrl.goBack = () => {
      $window.history.back();
    };

    defaultToolbarCtrl.$onInit = () => {
      console.log(defaultToolbarCtrl.menuOptions);
    };
  }
})();