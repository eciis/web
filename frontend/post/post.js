"use strict";

function Post(data, institution) {
    data = data || {};
    _.extend(this, data);

    this.institution = institution;
}

Post.prototype.deleteComment = function (commentId) {
    this.data_comments = this.data_comments
        .filter(comment => comment.id !== commentId);
    this.number_of_comments--;
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
        const match = this.video_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        const id = match[1];
        return 'https://www.youtube.com/embed/' + id;
    }
};

Post.prototype.hasVideo = function hasVideo() {
    var isNotNull = this.video_url !== null;
    var isNotUndefined = this.video_url !== undefined;
    var isNotEmpty = this.video_url !== "";
    return isNotNull && isNotEmpty && isNotUndefined;
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


Post.prototype.hasActivity = function hasActivity() {
    var hasComments = this.number_of_comments > 0;
    var hasLikes = this.number_of_likes > 0;

    return hasComments || hasLikes;
};