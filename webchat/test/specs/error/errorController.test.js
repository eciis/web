'use strict';

(describe('Test errorController', () => {
  let error, ctrl, state, states, params;

  error = {
    status: 418,
    msg: 'Test error'
  }

  params = error;

  beforeEach(module('webchat'));

  beforeEach(inject(($controller, $state, STATES) => {
    state = $state;
    states = STATES;

    ctrl = $controller('ErrorController', {
      $stateParams: params
    })
  }));

  it('"Voltar" button should send back to STATES.home', () => {
    spyOn(state, 'go').and.callThrough();
    ctrl.goToHome();
    expect(state.go).toHaveBeenCalledWith(states.home);
  })

  it('"Reportar erro" should send to CONFIG.SUPPORT_URL/report', () => {
    spyOn(window, 'open').and.callThrough();
    ctrl.goToReport();
    expect(window.open).toHaveBeenCalledWith(`${Config.SUPPORT_URL}/report`);
  })

  it('should have error status and error msg', () => {
    expect(ctrl.msg).toEqual(error.msg);
    expect(ctrl.status).toEqual(error.status);
  })
}));
