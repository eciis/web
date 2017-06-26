'use strict';

describe('Unit: Post model', function() {
    beforeEach(module('app'));

    var post, data;

    beforeEach(function() {
        data = {
            title: 'title',
            text: 'text',
            institution: {}
        };
        post = new Post(data, {});
    });

    // it('post should be a simple object', function() {
    //     expect(ctrl.post).toEqual({});
    // });

    it('post should be invalid', function() {
        var post = new Post(ctrl.post, {});
        expect(post.isValid()).toBeFalsy();
    });

    it('post should be valid', function() {
        ctrl.post = new Post(newPost, {});
        expect(ctrl.post.isValid()).toBeTruthy();
    });
});