'use strict';

(function() {
  function LoginCardController(AuthService, MessageService) {
    const ctrl = this;
    ctrl.user = {};
    ctrl.isLoadingUser = () => AuthService.isLoadingUser;

    ctrl.signIn = () => {
      return AuthService.loginWithEmailAndPassword(ctrl.user.email, ctrl.user.password).then(() => {
        ctrl.onLogin();
      }).catch((e) => {
        MessageService.showToast(e);
      });
    }

    ctrl.loginWithGoogle = () => {
      return AuthService.loginWithGoogle().then(() => {
        ctrl.onLogin();
      }).catch((e) => {
        MessageService.showToast(e);
      });
    }

    ctrl.resetPassword = () => {
      window.open(Config.FRONTEND_URL);
    }

    ctrl.$onInit = () => {
      if (_.isNil(ctrl.onLogin))
        ctrl.onLogin = () => {};
    }
  }

  angular.module('webchat')
    .component('loginCard', {
      templateUrl: 'app/auth/loginCard.html',
      controller: ['AuthService', 'MessageService', LoginCardController],
      controllerAs: 'ctrl',
      bindings: {
        onLogin: '&',
      },
    });
})();
