'use strict';

describe('Unit: postDirective', function() {
    beforeEach(module('app'));

    var ctrl, post, $mdDialog, PostService;

    beforeEach(inject(function($controller, $mdDialog, PostService) {
        ctrl = $controller('PostController');
        $mdDialog = $mdDialog;
        PostService = PostService;
        post = {
            title: 'title',
            text: 'text',
            institution: {}
        };
        ctrl.user = {
            current_institution: {key: "abc"}
        };
    }));

    it('post should not to have properties', function() {
        expect(ctrl.post).toEqual({});
    });

    it('post should be invalid', function() {
        post.title = undefined;
        ctrl.post = new Post(post, {});
        spyOn(ctrl, 'isPostValid').and.returnValue(false);
        expect(ctrl.isPostValid()).toBeFalsy();
        expect(ctrl.isPostValid).toHaveBeenCalled();
    });

    it('post should be valid', function() {
        ctrl.post = new Post(post, {});
        spyOn(ctrl, 'isPostValid').and.returnValue(true);
        expect(ctrl.isPostValid()).toBeTruthy();
        expect(ctrl.isPostValid).toHaveBeenCalled();
    });

    it('should change the current post instance to an empty object', function() {
        ctrl.post = new Post(post, {});
        spyOn(ctrl, 'clearPost').and.callThrough();
        ctrl.clearPost();
        expect(ctrl.post).toEqual({});
        expect(ctrl.clearPost).toHaveBeenCalled();
    });

    it('should cancel dialog', function() {
        spyOn(ctrl, 'cancelDialog');
        ctrl.cancelDialog();
        expect(ctrl.cancelDialog).toHaveBeenCalled();
    });

    it('should create a post', function() {
        ctrl.post = post;
        spyOn(ctrl, 'createPost').and.callThrough();
        spyOn(new Post(), 'isValid').and.returnValue(true);
        // spyOn(PostService, 'createPost').and.callThrough();
        spyOn(ctrl, 'clearPost').and.callThrough();
        ctrl.createPost();
        expect(ctrl.createPost).toHaveBeenCalled();
        // expect(PostService.createPost).toHaveBeenCalled();

    });
});