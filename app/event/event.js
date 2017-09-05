"use strict";

function Event(data, institution) {
    data = data || {};
    _.extend(this, data);
    this.convertDate();

    this.institution = institution;
}

Event.prototype.isValid = function isValid() {
    if (_.isUndefined(this.title) || _.isEmpty(this.title)) {
        return false; 
    }

    if (_.isUndefined(this.institution)) {
        return false; 
    }
    return true;
};

Event.prototype.convertDate = function(){
    this.start_time = this.start_time.toISOString();
    this.end_time = this.end_time.toISOString();
};