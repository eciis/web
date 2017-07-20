"use strict";

function Invite(data, type_of_invite, institution_key, inviter_email) {
    data = data || {};
    _.extend(this, data);

    this.type_of_invite = type_of_invite;
    this.institution_key = institution_key;
    this.inviter = inviter_email;
}

Invite.prototype.isValid = function isValid() {
    if (_.isUndefined(this.invitee) || _.isEmpty(this.invitee)) {
        return false;
    }
    return true;
};