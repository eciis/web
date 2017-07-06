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

    if (_.isUndefined(this.suggestion_institution_name) || _.isEmpty(this.suggestion_institution_name)) {
        console.log("suggestion_institution_name");
        return false;
    }

    console.log("return true");
    return true;
};