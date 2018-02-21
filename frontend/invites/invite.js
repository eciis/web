"use strict";

function Invite(data) {
    data = data || {};
    _.extend(this, data);
}

Invite.prototype.isValid = function isValid() {
    var noHasInvitee = (_.isUndefined(this.invitee) || _.isEmpty(this.invitee)) && this.type_of_invite != 'USER';
    var noHasType = _.isUndefined(this.type_of_invite) || _.isEmpty(this.type_of_invite);

    if (noHasInvitee || noHasType) {
        return false;
    }
    return true;
};