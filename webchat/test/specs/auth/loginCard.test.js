'use strict';

(describe('Test LoginCardController', () => {
  let scope, authService, ctrl, q;

  const user = { name: 'User', active: 'true' };

  beforeEach(module('webchat'));

  beforeEach(inject(($rootScope, $componentController, AuthService, $q) => {
    authService = AuthService;
    q = $q;
    scope = $rootScope.$new();
    ctrl = $componentController('loginCard', { $scope: scope });
    authService.logout();
    ctrl.$onInit();

    spyOn(ctrl, 'onLogin');
    expect(authService.isLoggedIn()).toBe(false);
  }))

  it('should take to main frontend page on "Esqueci minha senha"', () => {
    spyOn(window, 'open').and.callThrough();
    ctrl.resetPassword();
    expect(window.open).toHaveBeenCalledWith(Config.FRONTEND_URL);
  })

  it('backButton should take to Config.FRONTEND_URL by default', () => {
    spyOn(window, 'open').and.callThrough();
    ctrl.backButton();
    expect(window.open).toHaveBeenCalledWith(Config.FRONTEND_URL);
  })

  describe('login functions', () => {
    it('should log in and call onLogin after logging in with email and password', () => {
      spyOn(authService, 'loginWithEmailAndPassword').and.callFake(() => {
        return q.when(authService.login(user));
      });
      spyOn(ctrl, 'signIn').and.callThrough();
      ctrl.signIn();
      scope.$digest();
      expect(authService.loginWithEmailAndPassword).toHaveBeenCalled();
    })

    it('should log in and call onLogin after logging in with google', () => {
      spyOn(authService, 'loginWithGoogle').and.callFake(() => {
        return q.when(authService.login(user));
      });
      ctrl.loginWithGoogle();
      scope.$digest();
      expect(authService.loginWithGoogle).toHaveBeenCalled();
    })

    afterEach(() => {
      expect(authService.isLoggedIn()).toBe(true);
      expect(ctrl.onLogin).toHaveBeenCalledWith();
    })
  })
}));
