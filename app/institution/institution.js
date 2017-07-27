"use strict";

function Institution(data){
    data = data || {};
    _.extend(this, data);
}

Institution.prototype.make = function make() {
    var institution =  {
        acronym: this.acronym,
        key: this.key,
        photo_url: this.photo_url
    };
    return institution;
}