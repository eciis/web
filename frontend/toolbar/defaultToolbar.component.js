'use strict';

(function () {
  const app = angular.module("app");

  /**
   * Generic component that lives in some pages that doesn't need
   * the main toolbar. Only for mobile.
   * {object} menuOptions -- Some options the user can choose when the menu is clicked
   */
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
    
    /**
     * Redirect the user to the previous page.
     */
    defaultToolbarCtrl.goBack = () => {
      $window.history.back();
    };
  }
})();