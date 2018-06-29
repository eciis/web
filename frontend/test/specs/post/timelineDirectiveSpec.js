'use strict';

(describe('Test TimelineController', function() {
    beforeEach(module('app'));

    var timelineCtrl, createController, rootScope;
    var user = {
        name: 'name',
        key : 'key',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        permissions: {}
    };

    var post = {
        title: 'post principal',
        author_key: user.key,
        institution_key: "institution_key",
        key: "123456",
        state: 'published'
    };

    var post_with_activity = {
        title: 'post principal',
        author_key: user.key,
        institution_key: "institution_key",
        key: "123456",
        state: 'published',
        comments: "/api/posts/123456/comments",
        number_of_comments: 1
    };

    var options = [{'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] }];

    var survey = { 'title' : 'The Survey',
                    'type_survey' : 'multiple_choice',
                    'options' : options,
                    'key': '654321'
                    };

    var callback = function(){
        return {
            then : {}
        }
    };

    var content = {
        'scrollTop': 1,
        'offsetHeight': 3,
        'maxHeight': 5
    }

    var posts = [survey, post];

    beforeEach(inject(function($controller, AuthService, $rootScope) {
        rootScope = $rootScope;
        AuthService.login(user);

        spyOn(document, 'getElementById').and.callFake(function () {
            return content
            
        });

        spyOn(Utils, 'setScrollListener').and.callThrough();

        createController = function(){
            return $controller('TimelineController', {
                $rootScope: rootScope
            });
        }

        timelineCtrl = createController();

        timelineCtrl.content = content;
        timelineCtrl.loadMorePosts = callback;

        timelineCtrl.user = new User(user);
        timelineCtrl.posts = posts;
    }));

    describe('Should create observer', function() {
        it('should call root scope to create observer', function() {
            spyOn(rootScope, '$on').and.callThrough();
            timelineCtrl = createController();
            expect(rootScope.$on).toHaveBeenCalled();
        });
    });

    // describe('Should call loadMorePosts', function() {
    //     it('should call root scope to create observer', function() {
    //         spyOn(timelineCtrl, 'loadMorePosts').and.callThrough();
    //         timelineCtrl = createController();
    //         expect(timelineCtrl.loadMorePosts).toHaveBeenCalled();
    //     });
    // });

    describe('Should not call delete post function', function() {
        it("should do nothing.", function() {
            rootScope.$emit("DELETED_INSTITUTION", {});
            expect(timelineCtrl.posts.length).toEqual(2);
            expect(timelineCtrl.posts).toEqual(posts);
        });
    });

    describe('Should call delete post function', function() {
        
        it("should not delete post because it isn't in timeline.", function() {
            var post_not_timeline = { 
                title: 'Is not in timeline',
                key: "000",
                state: 'published'
            };

            rootScope.$emit("DELETED_POST", post_not_timeline);
            expect(timelineCtrl.posts.length).toEqual(2);
            expect(timelineCtrl.posts).toEqual(posts);
        });

        it('should not delete post because it has activity.', function() {
            timelineCtrl.posts = [survey, post];
            expect(timelineCtrl.posts[1].comments).toBeUndefined();
            expect(timelineCtrl.posts[1].number_of_comments).toBeUndefined();

            rootScope.$emit("DELETED_POST", post_with_activity);
            expect(timelineCtrl.posts.length).toEqual(2);
            expect(timelineCtrl.posts[1]).toEqual(new Post(post_with_activity));
        });

        it('should delete post.', function() {
            expect(timelineCtrl.posts).toEqual(posts);
            rootScope.$emit("DELETED_POST", post);
            expect(timelineCtrl.posts.length).toEqual(1);
            expect(timelineCtrl.posts).toEqual([survey]);

            rootScope.$emit("DELETED_POST", post);
            expect(timelineCtrl.posts.length).toEqual(1);
            expect(timelineCtrl.posts).toEqual([survey]);

            rootScope.$emit("DELETED_POST", survey);
            expect(timelineCtrl.posts.length).toEqual(0);
            expect(timelineCtrl.posts).toEqual([]);
        });
    });
}));