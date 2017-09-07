"use strict";

function Event(data, institution) {
    data = data || {};
    _.extend(this, data);

    this.institution_key = institution;
}

Event.prototype.isValid = function isValid() {
    if (_.isUndefined(this.title) || _.isEmpty(this.title)) {
        return false; 
    }

    if (_.isUndefined(this.local) || _.isEmpty(this.local)) {
        return false; 
    }

    if (_.isUndefined(this.institution_key)) {
        return false; 
    }
    return true;
};

Event.prototype.convertDate = function(){
    var size_date = 19;
    this.start_time = (this.start_time.toISOString()).substring(0, size_date);
    this.end_time = (this.end_time.toISOString()).substring(0, size_date);
};

