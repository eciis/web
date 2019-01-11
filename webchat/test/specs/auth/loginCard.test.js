'use strict';

(describe('Test LoginCardController', () => {
  let scope, authService, ctrl, q, user;

  beforeEach(module('webchat'));

  beforeEach(inject(($rootScope, $componentController, AuthService, $q) => {
    authService = AuthService;
    q = $q;
    scope = $rootScope.$new();
    ctrl = $componentController('loginCard', { $scope: scope });
    user = { name: 'User', active: 'true' };

    authService.logout();
    ctrl.$onInit();
    spyOn(authService, 'loginWithEmailAndPassword').and.callFake(() => {
      return q.when(AuthService.login(user));
    });
    spyOn(authService, 'loginWithGoogle').and.callFake(() => {
      return q.when(AuthService.login(user));
    });
    spyOn(ctrl, 'signIn').and.callThrough();
    spyOn(ctrl, 'onLogin');
    expect(authService.isLoggedIn()).toBe(false);
  }))

  it('logs in, calls onLogin after logging in with email and password', () => {
    ctrl.signIn();
    scope.$digest();
    expect(authService.loginWithEmailAndPassword).toHaveBeenCalled();
  })

  it('logs in, calls onLogin after logging in with google', () => {
    ctrl.loginWithGoogle();
    scope.$digest();
    expect(authService.loginWithGoogle).toHaveBeenCalled();
  })

  afterEach(() => {
    expect(authService.isLoggedIn()).toBe(true);
    expect(ctrl.onLogin).toHaveBeenCalledWith();
  })
}));
