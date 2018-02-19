"use strict";

function User(data) {
    data = data || {};
    _.extend(this, data);
}

User.prototype.isInactive = function isInactive() {
    var notActive = this.state != 'active';
    return notActive;
};

User.prototype.hasPermission = function hasPermission(permissionType, entityKey) {
    var key = entityKey;
    if (this.permissions[permissionType]) {
        return this.permissions[permissionType][key];
    }
    return false;
};