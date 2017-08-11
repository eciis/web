"use strict";

function User(data) {
    data = data || {};
    _.extend(this, data);

    if (this.institutions && !this.current_institution) {
        this.current_institution = this.institutions[0];
    }
}

var SENT = "sent";

var USER = "USER";

var INVITE_INSTITUTIONS_TYPE = ['INSTITUTION', 'INSTITUTION_PARENT', 'INSTITUTION_CHILDREN'];

User.prototype.changeInstitution = function changeInstitution(institution) {
    this.current_institution = _.find(this.institutions, {'key': institution.key});
    window.localStorage.userInfo = JSON.stringify(this);
};

User.prototype.follow = function follow(institution) {
    this.follows.push(institution);
};

User.prototype.unfollow = function unfollow(institution) {
    _.remove(this.follows, function(followingInst){
    	return followingInst.key == institution.key;
    });
};

User.prototype.isFollower = function isFollower(institution) {
	var isFollower = false;
    _.forEach(this.follows, function(followingInst) {
        if(followingInst.key == institution.key){
            isFollower = true;
        }
    });
    return isFollower;
};

User.prototype.isAdmin = function isAdmin(keyInstitution) {
    var managed_institution = _.find(this.institutions_admin, function(institution) {
      return getKey(institution) == keyInstitution; });
    return managed_institution;
};

User.prototype.isMember = function isMember(institutionKey){
    return _.includes(_.map(this.institutions, getKeyObj), institutionKey);
};

User.prototype.addInstitution = function addInstitution(institutionKey){
    this.institutions.push(institutionKey);
};


User.prototype.isValid = function isValid() {
    if (_.isUndefined(this.name) || _.isEmpty(this.name)) {
        return false;
    }

    if (_.isUndefined(this.email) || _.isEmpty(this.email)) {
        return false;
    }

    var cpfNotNull = this.cpf !== null;
    if (cpfNotNull && (_.isUndefined(this.cpf) || _.isEmpty(this.cpf))) {
        return false;
    }
    return true;
};

User.prototype.getPendingInvitation = function getPendingInvitation(){
    return _.find(this.invites, {'status': SENT});
};

User.prototype.removeInviteInst = function removeInviteInst(institutionKey) {
    _.remove(this.invites, function(invite){
        return institutionKey == invite.stub_institution_key;
    });
};

function getKeyObj(obj) {
    if(obj.key){
      return obj.key;
    }
}

function getKey(obj){
	var key = obj.split("/");
	key = key[key.length -1];

    return key;
}