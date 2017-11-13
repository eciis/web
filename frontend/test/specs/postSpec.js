'use strict';

describe('Test Post Model:', function() {
    beforeEach(module('app'));

    var data, post;

    beforeEach(function() {
        data = {
            title: 'title',
            text: 'text',
            institution: {}
        };
    });

    describe('isValid()', function() {
        it('should be invalid because of empty title', function() {
            data.title = "";
            post = new Post(data, {});
            expect(post.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined title', function() {
            data.title = undefined;
            post = new Post(data, {});
            expect(post.isValid()).toBeFalsy();
        });

         it('should be invalid because of empty text', function() {
            data.text = "";
            post = new Post(data, {});
            expect(post.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined text', function() {
            data.text = undefined;
            post = new Post(data, {});
            expect(post.isValid()).toBeFalsy();
        });

        it('should be invalid because of undefined institution', function() {
            post = new Post(data, undefined);
            expect(post.isValid()).toBeFalsy();
        });

        it('should be valid', function() {
            post = new Post(data, {});
            expect(post.isValid()).toBeTruthy();
        });
    });

    describe('getVideoUrl()', function() {
        it('should return undefined', function() {
            post = new Post(data);
            expect(post.getVideoUrl()).toBe(undefined);
        });
        
        it('should behave...', function() {
            data.video_url = 'https://www.youtube.com/watch?v=3T3g8rV-5GU';
            post = new Post(data);
            expect(post.getVideoUrl()).toBe('https://www.youtube.com/embed/3T3g8rV-5GU');
        });
    });

    describe('hasVideo()', function() {
        it('should be false when the video_url is undefined', function() {
            post = new Post(data);
            expect(post.hasVideo()).toBe(false);
        });

        it('should be false when the video_url is null', function() {
            data.video_url = null;
            post = new Post(data);
            expect(post.hasVideo()).toBe(false);
        });

        it('should be false when the video_url is empty', function() {
            data.video_url = "";
            post = new Post(data);
            expect(post.hasVideo()).toBe(false);
        });

        it('should be true when the video_url is valid', function() {
            data.video_url = "https://www.youtube.com/watch?v=3T3g8rV-5GU";
            post = new Post(data);
            expect(post.hasVideo()).toBe(true);
        });
    });

    describe('hasImage()', function() {
        it('should be false when the photo_url is undefined', function() {
            post = new Post(data);
            expect(post.hasImage()).toBe(false);
        });

        it('should be false when the photo_url is null', function() {
            data.photo_url = null;
            post = new Post(data);
            expect(post.hasImage()).toBe(false);
        });

        it('should be false when the photo_url is empty', function() {
            data.photo_url = "";
            post = new Post(data);
            expect(post.hasImage()).toBe(false);
        });

        it('should be true when the photo_url is valid', function() {
            data.photo_url = "www.photo-url.com";
            post = new Post(data);
            expect(post.hasImage()).toBe(true);
        });
    });

    describe('isDeleted()', function() {
        it('should be false when the state is deleted', function() {
            data.state = "deleted";
            post = new Post(data);
            expect(post.hasImage()).toBe(false);
        });

        it('should be true when the state is not deleted', function() {
            data.state = "published";
            post = new Post(data);
            expect(post.hasImage()).toBe(false);
        });
    });

    describe('remove()', function() {
        it('should set the post state to deleted', function() {
            post = new Post(data);
            post.remove("userName");
            expect(post.state).toBe('deleted');
        });

        it('should set post property last_modified_by to userName', function() {
            post = new Post(data);
            post.remove("userName");
            expect(post.last_modified_by).toBe('userName');
        });
    });
});