"use strict";

function Invite(data, type_of_invite, institution_key, inviter_email) {
    data = data || {};
    _.extend(this, data);

    this.type_of_invite = type_of_invite;
    this.institution_key = institution_key;
    this.inviter = inviter_email;
}

Invite.prototype.isValid = function isValid() {
    var noHasInvitee = _.isUndefined(this.invitee) || _.isEmpty(this.invitee);
    var noHasType = _.isUndefined(this.type_of_invite) || _.isEmpty(this.type_of_invite);

    if (noHasInvitee || noHasType) {
        return false;
    }
    return true;
};