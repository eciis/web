"use strict";

function Post(data, institution) {
    data = data || {};
    _.extend(this, data);

    this.institution = institution;
}

Post.prototype.isValid = function isValid() {
    if (_.isUndefined(this.title) || _.isEmpty(this.title)) {
        return false; 
    }

    if (_.isUndefined(this.text) || _.isEmpty(this.text)) {
        return false;
    }

    if (_.isUndefined(this.institution)) {
        return false; 
    }
    return true;
};