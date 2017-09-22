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

Post.prototype.getVideoUrl = function getVideoUrl() {
    if(this.video_url) {
        var params = _.split(this.video_url, '=');
        var id = params[params.length - 1];
        return 'https://www.youtube.com/embed/' + id;
    }
};

Post.prototype.hasVideo = function hasVideo() {
    var videoUrlNotNull = this.video_url !== null;
    var videoUrlNotEmpty = this.video_url !== "";
    return videoUrlNotNull && videoUrlNotEmpty;
};

Post.prototype.hasImage = function hasImage() {
    var imageNotEmpty = this.photo_url !== "";
    var imageNotNull = this.photo_url !== null;
    return imageNotEmpty && imageNotNull;
};

Post.prototype.isDeleted = function isDeleted() {
    return this.state === 'deleted';
};
