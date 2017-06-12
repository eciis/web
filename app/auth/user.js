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

User.prototype.isMember = function isMember(institutionKey){
      return _.includes(_.map(this.institutions, getKeyObj), institutionKey);
};

function getImage(email) {
    var hash = CryptoJS.MD5(email).toString();
    return 'https://www.gravatar.com/avatar/' + hash;
}


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