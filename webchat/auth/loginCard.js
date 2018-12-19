'use strict';

(function() {
  function LoginCardController() {
    const ctrl = this;
    ctrl.user = {};

    ctrl.signIn = () => {
      // login with AuthService
      ctrl.onLogin();
    }

    ctrl.$onInit = () => {
      if (_.isNil(ctrl.email))
        ctrl.email = true;
      if (_.isNil(ctrl.google))
        ctrl.google = true;
      if (_.isNil(ctrl.email))
        ctrl.invite = true;
    }
  }

  angular.module('webchat')
    .component('loginCard', {
      templateUrl: 'app/auth/loginCard.html',
      controller: LoginCardController,
      controllerAs: 'ctrl',
      bindings: {
        email: '<',
        google: '<',
        invite: '<',
        onLogin: '&',
      },
    });
})();
