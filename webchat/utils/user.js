'use strict';
(function () {
  const app = angular.module('webchat');

  app.factory('User', () => {
    function User(data) {
      data = data || {};
      _.extend(this, data);

      if (!this.current_institution) {
        this.changeInstitution();
      }
    }

    User.prototype.changeInstitution = function changeInstitution(institution) {
      if (this.institutions && this.institutions.length > 0) {
        institution = institution || this.institutions[0];
        this.current_institution = _.find(this.institutions, { 'key': institution.key });
        window.localStorage.userInfo = JSON.stringify(this);
      }
    };

    User.prototype.follow = function follow(institution) {
      institution = {
        acronym: institution.acronym,
        key: institution.key,
        photo_url: institution.photo_url,
        legal_nature: institution.legal_nature,
        actuation_area: institution.actuation_area
      };
      this.follows.push(institution);
    };

    User.prototype.unfollow = function unfollow(institution) {
      _.remove(this.follows, function (followingInst) {
        return followingInst.key == institution.key;
      });
    };

    User.prototype.isFollower = function isFollower(institution) {
      const isFollower = false;
      _.forEach(this.follows, function (followingInst) {
        if (followingInst.key == institution.key) {
          isFollower = true;
        }
      });
      return isFollower;
    };

    User.prototype.isMember = function isMember(institutionKey) {
      return _.includes(_.map(this.institutions, getKeyObj), institutionKey);
    };

    User.prototype.isInactive = function isInactive() {
      var notActive = this.state != 'active';
      return notActive;
    };

    User.prototype.getProfileColor = function getProfileColor() {
      const instKey = this.current_institution.key;
      return this.institution_profiles.reduce(
        (color, profile) => (profile.institution_key === instKey) ? profile.color : color,
        'teal'
      );
    }

    function getKeyObj(obj) {
      if (obj.key) {
        return obj.key;
      }
    }

    return User;
  })
})();
