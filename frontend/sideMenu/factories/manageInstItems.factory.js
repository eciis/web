"use strict";

(function () {
    angular
    .module('app')
    .factory('ManageInstItemsFactory', function ($state, STATES, $mdDialog) {
        const factory = {};

        const removeInstitution = (event, institution) => {
          $mdDialog.show({
              templateUrl: Utils.selectFieldBasedOnScreenSize(
                  'app/institution/removeInstDialog.html', 'app/institution/remove_inst_mobile.html', SCREEN_SIZES.SMARTPHONE),
              targetEvent: event,
              clickOutsideToClose:true,
              locals: { institution },
              controller: "RemoveInstController",
              controllerAs: 'removeInstCtrl'
          });
        };
        
        factory.getItems = institution => {
            const institutionKey = institution.key;
            return [
                {
                    icon: 'edit',
                    description: 'Editar Informações',
                    stateName: 'MANAGE_INST_EDIT',
                    onClick: () => $state.go(STATES.MANAGE_INST_EDIT, {institutionKey})
                },
                {
                    icon: 'people',
                    description: 'Gerenciar membros',
                    stateName: 'MANAGE_INST_MEMBERS',
                    onClick: () => $state.go(STATES.MANAGE_INST_MEMBERS, {institutionKey})
                },
                {
                    icon: 'account_balance',
                    description: 'Vínculos Institucionais',
                    stateName: 'MANAGE_INST_INVITE_INST',
                    onClick: () => $state.go(STATES.MANAGE_INST_INVITE_INST, {institutionKey})
                },
                {
                    icon: 'delete',
                    description: 'Remover Instituição',
                    onClick: event => removeInstitution(event, institution)
                },
                {
                    icon: 'arrow_back',
                    description: 'Voltar',
                    onClick: () => $state.go(STATES.HOME)
                }
            ];
        };

        return factory;
    });
})();