(function () {
    'use strict';

    angular.module("webchat").component("userDescription", {
        templateUrl: "app/components/user-description/user-description.html",
        controller: userDescriptionController,
        controllerAs: "userDescriptionCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
            name: "@",
            description: "@",
            avatar: "@",
            onClick: "&",
        },
    });

    function userDescriptionController() {
        const userDescriptionCtrl = this;
    }

})();