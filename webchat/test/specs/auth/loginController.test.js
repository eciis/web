'use strict';

(describe('Test LoginController', function () {
  let ctrl, httpBackend, state, authService, states, scope;

  const user = {
    name: 'ecis',
    state: 'active'
  };

  beforeEach(module('webchat'));

  beforeEach(inject(($controller, $httpBackend, $rootScope, STATES, $state, AuthService) => {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    state = $state;
    states = STATES;
    authService = AuthService;

    httpBackend.when('GET', "main/main.html").respond(200);
    httpBackend.when('GET', "home/home.html").respond(200);

    authService.login(user);

    spyOn(authService, 'isLoggedIn').and.callThrough();
    spyOn(state, 'go').and.callThrough();
    ctrl = $controller('LoginController', {
      scope: scope,
      AuthService: authService
    });
  }));

  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('$onInit', () => {
    it('should change state to webchat.home if user is loggedIn', () => {
      ctrl.$onInit();
      expect(authService.isLoggedIn).toHaveBeenCalled();
      expect(state.go).toHaveBeenCalledWith(states.home);
    });
  });
}));
