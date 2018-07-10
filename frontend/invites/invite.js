"use strict";

function Invite(data) {
    data = data || {};
    _.extend(this, data);

    this.institution = this.institution && new Institution(this.institution);
    this.requested_institution = this.requested_institution &&
        new Institution(this.requested_institution);
}

Invite.prototype.isValid = function isValid() {
    const hasType = isValueValid(this.type_of_invite);
    const hasInviteeWhenNeeded = this.type_of_invite == 'USER' || isValueValid(this.invitee);
    return hasType && hasInviteeWhenNeeded; 
};

Invite.prototype.isStatusOn = function isStatusOn(value) {
    return this.status === value;
};

Invite.prototype.setStatus = function (status) {
    this.status = status;
};

Invite.prototype.setType = function (typeOfInvite) {
    this.type_of_invite = typeOfInvite;
};

Invite.prototype.areInstitutionsValid = function () {
    const isNotInstitutionInactive = ! this.institution.isStateOn('inactive');
    const isNotRequestedInstInactive = this.requested_institution ? ! this.requested_institution.isStateOn('inactive') : true;
    return isNotInstitutionInactive && isNotRequestedInstInactive;
}

function isValueValid(value) {
    return  !(_.isUndefined(value) || _.isEmpty(value));
}