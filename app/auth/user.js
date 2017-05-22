"use strict";

function User(data) {
    data = data || {};
    _.extend(this, data);

    this.image = getImage(this.email);
    this.current_institution = this.institutions[0];
}

User.prototype.changeInstitution = function changeInstitution(name) {
    this.current_institution = _.find(this.institutions, {'name': name});
};

function getImage(email) {
    var hash = CryptoJS.MD5(email).toString();
    return 'https://www.gravatar.com/avatar/' + hash;
}