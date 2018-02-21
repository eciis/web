"use strict";

function Invite(data) {
    data = data || {};
    _.extend(this, data);
}

Invite.prototype.isValid = function isValid() {
    var isInviteeNecessary = this.type_of_invite != 'USER';
    var HasNoInvitee = (_.isUndefined(this.invitee) || _.isEmpty(this.invitee)) && isInviteeNecessary;
    var HasNoType = _.isUndefined(this.type_of_invite) || _.isEmpty(this.type_of_invite);

    if (HasNoInvitee || HasNoType) {
        return false;
    }
    return true;
};