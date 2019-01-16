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

        User.prototype.isAdmin = function isAdmin(keyInstitution) {
            var managed_institution = _.find(this.institutions_admin, function(institution) {
            return getKey(institution) == keyInstitution; });
            return managed_institution;
        };

        User.prototype.isAdminOfCurrentInst = function isAdminOfCurrentInst() {
            return this.institutions_admin.map(getKey).includes(this.current_institution.key);
        };

        User.prototype.isMember = function isMember(institutionKey){
            return _.includes(_.map(this.institutions, getKeyObj), institutionKey);
        };

        User.prototype.isInactive = function isInactive() {
            var notActive = this.state != 'active';
            return notActive;
        };

        User.prototype.hasPermission = function hasPermission(permissionType) {
            return permissionType in this.permissions;
        };

        function getKeyObj(obj) {
            if(obj.key){
            return obj.key;
            }
        }

        function getKey(obj){
            var key = obj.split("/");
            key = key[key.length -1];

            return key;
        }

        return {
            user: User
        };
    });
})();