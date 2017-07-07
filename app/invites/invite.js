"use strict";

function Invite(data, type_of_invite) {
    data = data || {};
    _.extend(this, data);

    this.type_of_invite = type_of_invite;
}

Invite.prototype.isValid = function isValid() {
    if (_.isUndefined(this.invitee) || _.isEmpty(this.invitee)) {
        console.log("invitee");
        return false;
    }
    return true;
};