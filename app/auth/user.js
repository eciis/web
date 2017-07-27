"use strict";

function User(data) {
    data = data || {};
    _.extend(this, data);

    if (this.institutions) {
        this.current_institution = this.institutions[0];
    }
}

User.prototype.changeInstitution = function changeInstitution(name) {
    this.current_institution = _.find(this.institutions, {'name': name});
};

User.prototype.follow = function follow(keyInstitution) {
    this.follows.push(keyInstitution);
};

User.prototype.unfollow = function unfollow(keyInstitution) {
    _.remove(this.follows, function(institution){
    	return getKey(institution) == keyInstitution;
    });
};

User.prototype.isFollower = function isFollower(keyInstitution) {
	var isFollower = false;

    _.forEach(this.follows, function(institution) {
          var key = getKey(institution);
          if(key === keyInstitution){
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

User.prototype.getPendingInvitationOf = function getPendingInvitationOf(invitationType){
    if(invitationType == 'user'){
        return this.getPendingInviteUser();
    } else{
        return this.getPendingInviteInst(this);
    }    
};

User.prototype.getPendingInviteUser = function getInviteUser(){
    return _.find(this.invites, {'type_of_invite': 'user', 'status': 'sent'});
};

User.prototype.getPendingInviteInst = function getInviteInst(){
    var typeInviteInst = ['institution', 'institution_parent'];

    return _.find(this.invites, function(invite) {
           return (_.includes(typeInviteInst, invite.type_of_invite) &&
                  invite.status == 'sent');
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