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
    if (_.isUndefined(this.name) || _.isEmpty(this.name)) {
        return false;
    }

    if (_.isUndefined(this.email) || _.isEmpty(this.email)) {
        return false;
    }

    if (_.isUndefined(this.cnpj) || _.isEmpty(this.cnpj)) {
        return false;
    }

    if (_.isUndefined(this.legal_nature) || _.isEmpty(this.legal_nature)) {
        return false;
    }

    if (_.isUndefined(this.address) || _.isEmpty(this.address)) {
        return false;
    }

    if (_.isUndefined(this.occupation_area) || _.isEmpty(this.occupation_area)) {
        return false;
    }

    if (_.isUndefined(this.occupation_area) || _.isEmpty(this.occupation_area)) {
        return false;
    }

    if (_.isUndefined(this.leader) || _.isEmpty(this.leader)) {
        return false;
    }

    if (_.isUndefined(this.institutional_email) || _.isEmpty(this.institutional_email)) {
        return false;
    }

    return true;
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
