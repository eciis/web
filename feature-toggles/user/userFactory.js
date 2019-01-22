(function() {
    'use strict';

    const app = angular.module('app');

    app.factory('UserFactory', () => {

        /**
         * User model.
         * @param {*} data - data of user. 
         */
        function User(data) {
            data = data || {};
            _.extend(this, data);

            if (!this.current_institution) {
                this.changeInstitution();
            }
        }

        /**
         * This function modifies the user's current institution.
         * @param {Object} institution - institution to be change.
         */
        User.prototype.changeInstitution = function changeInstitution(institution) {
            if (this.institutions && this.institutions.length > 0) {
                institution = institution || this.institutions[0];
                this.current_institution = _.find(this.institutions, {'key': institution.key});
                window.localStorage.userInfo = JSON.stringify(this);
            }
        };

        /**
         * This function checks whether the user has the permission passed by parameter.
         * @param {String} permissionType - permission to be checked.
         */
        User.prototype.hasPermission = function hasPermission(permissionType) {
            return permissionType in this.permissions;
        };


        return {
            user: User
        };
    });
})();