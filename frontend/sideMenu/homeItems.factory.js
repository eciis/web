"use strict";

(function () {
    angular
    .module('app')
    .factory('HomeItemsFactory', function ($state, STATES, AuthService, $mdDialog) {
        const factory = {};
        
        const isSuperUser = user => user.hasPermission('analyze_request_inst');

        const takeTour = event => {
            $mdDialog.show({
                templateUrl: 'app/invites/welcome_dialog.html',
                controller: function WelcomeController() {
                    const controller = this;
                    controller.next = false;
                    controller.cancel = function() {
                        $mdDialog.cancel();
                    };
                },
                controllerAs: "controller",
                targetEvent: event,
                clickOutsideToClose: false
            });
        };

        factory.getItems = user => {
            const institutionKey = user.current_institution.key;
            return [
                {
                    icon: 'home',
                    description: 'Início',
                    stateName: 'HOME',
                    onClick: () => $state.go(STATES.HOME)
                },
                {
                    icon: 'account_box',
                    description: 'Meu Perfil',
                    stateName: 'CONFIG_PROFILE',
                    onClick: () => $state.go(STATES.CONFIG_PROFILE)
                },
                {
                    icon: 'date_range',
                    description: 'Eventos',
                    stateName: 'EVENTS',
                    onClick: () => $state.go(STATES.EVENTS)
                },
                {
                    icon: 'mail_outline',
                    iconClass: 'notification-badge',
                    description: 'Convites',
                    stateName: 'INVITE_INSTITUTION',
                    onClick: () => $state.go(STATES.INVITE_INSTITUTION),
                    showIf: () => isSuperUser(user)
                },
                {
                    icon: 'account_balance',
                    description: 'Gerenciar instituição',
                    stateName: 'MANAGE_INST_EDIT',
                    showIf: () => user.isAdminOfCurrentInst(),
                    sectionTitle: 'INSTITUIÇÃO',
                    topDivider: true,
                    onClick: () => $state.go(STATES.MANAGE_INST_EDIT, {institutionKey}),
                },
                {
                    icon: 'account_circle',
                    iconClass: 'notification-badge',
                    description: 'Gerenciar Membros',
                    stateName: 'MANAGE_INST_MEMBERS',
                    showIf: () => user.isAdminOfCurrentInst(),
                    onClick: () => $state.go(STATES.MANAGE_INST_MEMBERS, {institutionKey}),
                },
                {
                    icon: 'account_balance',
                    iconClass: 'notification-badge',
                    description: 'Vínculos Institucionais',
                    stateName: 'MANAGE_INST_INVITE_INST',
                    bottomDivider: true,
                    showIf: () => user.isAdminOfCurrentInst(),
                    onClick: () => $state.go(STATES.MANAGE_INST_INVITE_INST, {institutionKey}),
                },
                {
                    icon: 'account_balance',
                    description: 'Instituições cadastradas',
                    stateName: 'USER_INSTITUTIONS',
                    onClick: () => $state.go(STATES.USER_INSTITUTIONS)
                },
                {
                    icon: 'card_travel',
                    description: 'Iniciar Tutorial',
                    onClick: event => takeTour(event)
                },
                {
                    icon: 'exit_to_app',
                    description: 'Sair',
                    onClick: () => AuthService.logout()
                },
            ];
        };

        return factory;
    });
})();