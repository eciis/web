'use strict';

(function() {
  function LoginCardController(AuthService, MessageService) {
    const ctrl = this;
    ctrl.user = {};

    ctrl.isLoadingUser = () => AuthService.isLoadingUser;

    ctrl.signIn = async () => {
      try {
        await AuthService.loginWithEmailAndPassword(ctrl.user.email, ctrl.user.password);
        ctrl.onLogin();
      } catch (e) {
        MessageService.showToast(e);
      }
    }

    ctrl.loginWithGoogle = async () => {
      try {
        await AuthService.loginWithGoogle();
        ctrl.onLogin();
      } catch (e) {
        MessageService.showToast(e);
      }
    }

    ctrl.$onInit = () => {
      if (_.isNil(ctrl.email))
        ctrl.email = true;
      if (_.isNil(ctrl.google))
        ctrl.google = true;
      if (_.isNil(ctrl.invite))
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
