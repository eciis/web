'use strict';

(function () {
  function AddressFormController(brCidadesEstados, HttpService) {
    const ctrl = this;
    ctrl.states = {};
    ctrl.countries = {};
    ctrl.cities = {};

    ctrl.numberRegex = /\d+$/;
    ctrl.cepRegex = /\d{5}\-\d{3}/;

    Object.defineProperty(ctrl, 'isAnotherCountry', {
      get: function() {
        return ctrl.address && ctrl.address.country !== 'Brasil';
      }
    });

    Object.defineProperty(ctrl, 'cities', {
      get: function() {
        if (ctrl.address && !ctrl.isAnotherCountry) {
          const currentState = _.find(brCidadesEstados.estados,
            e => _.isEqual(e.nome, ctrl.address.federal_state))
          if (currentState) {
            return currentState.cidades;
          }
        }
      }
    });

    ctrl.$onInit = () => {
      ctrl.states = brCidadesEstados.estados;
      HttpService.get('app/institution/countries.json').then(res => {
        ctrl.countries = res;
      });
    }
  }

  const app = angular.module('app');
  app.component('addressForm', {
    controller: AddressFormController,
    controllerAs: 'ctrl',
    templateUrl: 'app/institution/forms/address_form.html',
    bindings: {
      address: '=',
    }
  });
})();
