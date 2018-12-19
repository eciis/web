'use strict';

(function() {
  function LoginCardController(AuthService) {
    const ctrl = this;
    ctrl.user = {};

    ctrl.signIn = async () => {
      try {
        await AuthService.loginWithEmailAndPassword(ctrl.user.email, ctrl.user.password);
        ctrl.onLogin();
      } catch (e) {
        console.log("Error ocurred")
        console.log(e)
      }
    }

    ctrl.loginWithGoogle = async () => {
      try {
        await AuthService.loginWithGoogle();
        console.log(AuthService.getCurrentUser());
        ctrl.onLogin();
      } catch (e) {
        console.log("Error ocurred")
        console.log(e)
      }
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
