(function () {
    'use strict';

    angular.module("app").service('EmailService', ["HttpService", "URL_CONSTANTS", function emailService(HttpService, URL_CONSTANTS) {
        const emailService = this;

        emailService.STATE_LINK_EMAIL_API_URI = "/api/email/current-state";

        emailService.sendStateLink = (stateLink) => {
            return HttpService.post(emailService.STATE_LINK_EMAIL_API_URI, {
                "data": {
                    "state-link": URL_CONSTANTS.FRONTEND + stateLink
                }
            });
        };
    }]);
})();