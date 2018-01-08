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
        var videoUrls = this.video_url.map(url => {
            var params = _.split(url.url, '=');
            var id = params[params.length - 1];
            console.log(url, id)
            return 'https://www.youtube.com/embed/' + id;
        });

        return videoUrls;
    }
};

Post.prototype.hasVideo = function hasVideo() {
    var isNotNull = this.video_url !== null;
    var isNotUndefined = this.video_url !== undefined;
    var isNotEmpty = isNotNull && isNotUndefined && this.video_url.length !== 0;
    return isNotEmpty;
};

Post.prototype.hasImage = function hasImage() {
    var isNotEmpty = this.photo_url !== "";
    var isNotNull = this.photo_url !== null;
    var isNotUndefined = this.photo_url !== undefined;
    return isNotEmpty && isNotNull && isNotUndefined;
};

Post.prototype.isDeleted = function isDeleted() {
    return this.state === 'deleted';
};

Post.prototype.remove = function remove(userName) {
    this.state = 'deleted';
    this.last_modified_by = userName;
    this.last_modified_date = new Date().toISOString();
};
