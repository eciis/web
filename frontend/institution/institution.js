"use strict";

function Institution(data) {
    data = data || {};
    _.extend(this, data);
}

Institution.prototype.make = function make() {
    var institution =  {
        acronym: this.acronym,
        key: this.key,
        photo_url: this.photo_url
    };
    return institution;
};


Institution.prototype.isValid = function isValid() {
    var required_fields = [this.name, this.legal_nature, this.address,
        this.actuation_area, this.leader, this.description];
    var isValid = true;

    _.forEach(required_fields, function(field) {
        if (_.isUndefined(field) || _.isEmpty(field)) {
            isValid = false;
        }
    });
    return isValid;
};

Institution.prototype.addInvite = function addInvite(invite){
    this.sent_invitations.push(invite);
};

Institution.prototype.createStub = function createStub(invite){
    var stub = new Institution();
    stub.name = invite.suggestion_institution_name;
    stub.state = 'pending';

    return stub;
};

Institution.prototype.addParentInst = function addParentInst(institution){
    this.parent_institution = institution;
};

Institution.prototype.addChildrenInst = function addChildrenInst(institution){
    this.children_institutions.push(institution);
};

Institution.prototype.getFullAddress = function getFullAddress() {
    if(this.address) {
        var fullAddress = this.address.street + ", " + this.address.number + ", " + this.address.neighbourhood +
                         ", " + this.address.city + ", " + this.address.federal_state + ", " + this.address.country;
        return fullAddress;
    }
};
