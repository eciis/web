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
    }
    return institution;
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
