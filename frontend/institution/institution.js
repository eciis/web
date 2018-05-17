"use strict";

function Institution(data) {
    data = data || {};
    _.extend(this, data);
}

Institution.prototype.isValidAddress = function isValidAdress(){
    var valid = true;
    if(this.address && this.address.country === "Brasil"){
        _.forEach(this.address, function(value, key) {
            var isNotNumber =  key !== "number";
            var isValid =  !value || _.isEmpty(value); 
            if(isNotNumber && isValid) {
                valid = false;
            }
        });
    }
    return valid;
};

Institution.prototype.isValid = function isValid() {
    var required_fields = [this.name, this.legal_nature,
        this.actuation_area, this.leader, this.description];
    var isValid = true;

    _.forEach(required_fields, function(field) {
        if (_.isUndefined(field) || _.isEmpty(field)) {
            isValid = false;
        }
    });
    return isValid && this.isValidAddress();
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

Institution.prototype.addChildInst = function addChildInst(institution){
    const INVALID_INDEX = -1;
    const childIndex = this.children_institutions.reduce((childIndex, inst, index) => {
        return inst.key && inst.key === institution.key ? index : childIndex;
    }, INVALID_INDEX);
    const childIsNew = childIndex == INVALID_INDEX;

    childIsNew ? this.children_institutions.push(institution) : null;
};

Institution.prototype.getFullAddress = function getFullAddress() {
    if(this.address) {
        var fullAddress = this.address.street + ", " + this.address.number + ", " + this.address.neighbourhood +
                         ", " + this.address.city + ", " + this.address.federal_state + ", " + this.address.country;
        return fullAddress;
    }
};
