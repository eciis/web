(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('PermissionSelectController', permissionSelectController)
        .component('permissionSelect', {
        templateUrl: 'app/manage/permission-select.html',
        controller: "PermissionSelectController",
        controllerAs: 'permissionSelectCtrl',
        bindings: {
            label: '@',
            feature: '=',
            attr: '@'
        }
    });

    function permissionSelectController() {
        const permissionSelectCtrl = this;
        
        Object.defineProperty(permissionSelectCtrl, 'enable', {
            get: () => permissionSelectCtrl.feature[permissionSelectCtrl.attr],
            set: value => permissionSelectCtrl.feature[permissionSelectCtrl.attr] = value
        });
    }
})();