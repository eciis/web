"use strict";

function Event(data, institution) {
    data = data || {};
    _.extend(this, data);

    this.institution_key = institution;

    this.convertDate();
}

Event.prototype.isValid = function isValid() {
    var hasNoTitle = _.isUndefined(this.title) || _.isEmpty(this.title);
    var hasNoLocal = _.isUndefined(this.local) || _.isEmpty(this.local)
    var hasNoInstKey = _.isUndefined(this.institution_key);

    return !(hasNoTitle || hasNoLocal || hasNoInstKey);
};

Event.prototype.convertDate = function(){
    if(typeof this.start_time === "object" && typeof this.end_time === "object") {
        var size_date = 19;
        this.start_time = (this.start_time.toISOString()).substring(0, size_date);
        this.end_time = (this.end_time.toISOString()).substring(0, size_date);
    }
};

Event.prototype.addFollower = function (userKey) {
    this.followers.push(userKey);
};

Event.prototype.removeFollower = function (userKey) {
    this.followers = this.followers.filter(currentFollower => {currentFollower !== userKey});
};

