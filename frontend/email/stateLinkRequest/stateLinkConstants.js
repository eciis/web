(function () {
    'use strict';

    angular.module("app").constant('STATE_LINKS', {
        'CREATE_EVENT': '/events',
        'MANAGE_INSTITUTION': '/institution/INSTITUTION_KEY/edit',
        'INVITE_INSTITUTION': '/inviteInstitution'
    });
})();