(function() {
    'use strict';

    const app = angular.module('app');

    app.factory('UserFactory', () => {

        function User(data) {
            data = data || {};
            _.extend(this, data);

            if (!this.current_institution) {
                this.changeInstitution();
            }
        }

        User.prototype.changeInstitution = function changeInstitution(institution) {
            if (this.institutions && this.institutions.length > 0) {
                institution = institution || this.institutions[0];
                this.current_institution = _.find(this.institutions, {'key': institution.key});
                window.localStorage.userInfo = JSON.stringify(this);
            }
        };


        User.prototype.hasPermission = function hasPermission(permissionType) {
            return permissionType in this.permissions;
        };


        return {
            user: User
        };
    });
})();