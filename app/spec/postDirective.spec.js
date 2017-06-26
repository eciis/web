'use strict';

describe('Unit: postDirective', function() {
    beforeEach(module('app'));

    var ctrl, newPost;

    beforeEach(inject(function($controller) {
        ctrl = $controller('PostController');
        newPost = {
            title: 'title',
            text: 'text',
            institution: {}
        };
    }));

    it('post should be a simple object', function() {
        expect(ctrl.post).toEqual({});
    });

    it('post should be invalid', function() {
        var post = new Post(ctrl.post, {});
        expect(post.isValid()).toBeFalsy();
    });

    it('post should be valid', function() {
        ctrl.post = new Post(newPost, {});
        expect(ctrl.post.isValid()).toBeTruthy();
    });
});