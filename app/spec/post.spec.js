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

    it('should be invalid because of empty title', function() {
        data.title = "";
        post = new Post(data, {});
        spyOn(post, 'isValid').and.returnValue(false);
        expect(post.isValid()).toBeFalsy();
        expect(post.isValid).toHaveBeenCalled();
    });

    it('should be invalid because of undefined title', function() {
        data.title = undefined;
        post = new Post(data, {});
        spyOn(post, 'isValid').and.returnValue(false);
        expect(post.isValid()).toBeFalsy();
        expect(post.isValid).toHaveBeenCalled();
    });

     it('should be invalid because of empty text', function() {
        data.text = "";
        post = new Post(data, {});
        spyOn(post, 'isValid').and.returnValue(false);
        expect(post.isValid()).toBeFalsy();
        expect(post.isValid).toHaveBeenCalled();
    });

    it('should be invalid because of undefined text', function() {
        data.text = undefined;
        post = new Post(data, {});
        spyOn(post, 'isValid').and.returnValue(false);
        expect(post.isValid()).toBeFalsy();
        expect(post.isValid).toHaveBeenCalled();
    });

    it('should be invalid because of undefined institution', function() {
        post = new Post(data, undefined);
        spyOn(post, 'isValid').and.returnValue(false);
        expect(post.isValid()).toBeFalsy();
        expect(post.isValid).toHaveBeenCalled();
    });

    it('should be valid', function() {
        post = new Post(data, {});
        spyOn(post, 'isValid').and.returnValue(true);
        expect(post.isValid()).toBeTruthy();
        expect(post.isValid).toHaveBeenCalled();
    });
});