(function () {
    'use strict';

    angular.module("app").service('StateLinkRequestService', ['$mdDialog', function StateLinkRequestService($mdDialog) {
        const StateLinkRequestService = this;

        /**
         * It shows a dialog that will ask the user if it wants to receive the link of the state
         * by email. It is used in pages that has big forms to be filled.
         *
         * @param stateLink the state link that will be sent by email.
         * @param previousState the state that the user will comeback if it accepts to receive
         * the email.
         */
        StateLinkRequestService.showLinkRequestDialog = (stateLink, previousState) => {
            $mdDialog.show({
                templateUrl: "app/email/stateLinkRequest/stateLinkRequestDialog.html",
                clickOutsideToClose:true,
                locals: {
                    stateLink: stateLink,
                    previousState: previousState,
                },
                controller: [
                    'EmailService',
                    '$state',
                    'stateLink',
                    'previousState',
                    StateLinkRequestController,
                ],
                controllerAs: 'ctrl'
            });
        };

        function StateLinkRequestController(EmailService, $state, stateLink, previousState) {
            const ctrl = this;

            ctrl.sendStateLink = () => {
                EmailService.sendStateLink(stateLink);
                $state.go(previousState);
            };
        }
    }]);
})();