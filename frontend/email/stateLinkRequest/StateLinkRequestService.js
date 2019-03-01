(function () {
    'use strict';

    angular.module("app").service('StateLinkRequestService', ['$mdDialog', function StateLinkRequestService($mdDialog) {
        const StateLinkRequestService = this;

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