'use strict';

(describe('Test TimelineController', function() {
    beforeEach(module('app'));

    let timelineCtrl, createController, rootScope, scope, notificationService, postsFactory, q;

    let user = {
        name: 'name',
        key : 'key',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        permissions: {}
    };

    let post = {
        title: 'post principal',
        author_key: user.key,
        institution_key: "institution_key",
        key: "123456",
        state: 'published'
    };

    let post_toAdd = {
        title: 'post principal',
        author_key: user.key,
        institution_key: "institution_key",
        key: "123456",
        state: 'published',
        comments: "/api/posts/123456/comments",
        number_of_comments: 1
    };

    let options = [{'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] }];

    let survey = { 'title' : 'The Survey',
                    'type_survey' : 'multiple_choice',
                    'options' : options,
                    'key': '654321'
                    };

    let content = {
        'scrollTop': 1,
        'offsetHeight': 3,
        'scrollHeight': 5
    }

    let posts = [survey, post];

    beforeEach(inject(function($controller, AuthService, $rootScope, 
        NotificationService, $q, PostsFactory) {
        rootScope = $rootScope;
        postsFactory = PostsFactory;
        scope = $rootScope.$new();
        notificationService = NotificationService;
        q = $q;
        
        AuthService.login(user);

        spyOn(document, 'getElementById').and.callFake(function () {
            return content
        });

        spyOn(Utils, 'setScrollListener').and.callThrough();

        createController = function(){
            return $controller('TimelineController', {
                scope: scope,
                $rootScope: rootScope,
                $scope: scope,
                NotificationService: notificationService,
                $q: $q,
                PostsFactory: postsFactory
            });
        };

        spyOn(postsFactory.posts.prototype, 'addPost').and.callThrough();
        spyOn(postsFactory.posts.prototype, 'loadMorePosts').and.callThrough();
        spyOn(postsFactory.posts.prototype, 'getNextPosts').and.callFake(function () {
            return {
                then: function (callback) {
                    const data = {
                        posts: posts,
                        next: true
                    };
                    return callback(data);
                }
            }
        });
        spyOn(notificationService, 'watchPostNotification');

        timelineCtrl = createController();

        timelineCtrl.content = content;
        timelineCtrl.user = new User(user);

        expect(notificationService.watchPostNotification).toHaveBeenCalled();
        expect(Utils.setScrollListener).toHaveBeenCalled();
    }));

    describe('setUpTimelineProperties()', () => {
        it('should set the timeline as institutionTimeline', () => {
            scope.institution = 'aopskdaop-OPAKDOPA';
            timelineCtrl = createController();
            expect(timelineCtrl.postsType).toEqual(postsFactory.institutionTimelinePosts);
            expect(timelineCtrl.contentId).toEqual("instPage");
        });

        it('should set the timeline as timelinePosts', () => {
            delete scope.institution;
            timelineCtrl = createController();
            expect(timelineCtrl.postsType).toEqual(postsFactory.timelinePosts);
            expect(timelineCtrl.contentId).toEqual("content");
        });
    });

    describe('Should create observer', function() {
        it('should call root scope to create observer', function() {
            spyOn(rootScope, '$on').and.callThrough();
            timelineCtrl = createController();
            expect(rootScope.$on).toHaveBeenCalled();
        });
    });

    describe('Should call loadMorePosts', function() {
        it('should set variable testLoadMorePosts to true.' +
            ' This variable was create to test if function that was' +
            ' passed through bind Controller is called', function() {

            var callbackLoadMorePost = function(){
                return {
                    then : function(){
                        timelineCtrl.testLoadMorePosts = true;
                        return timelineCtrl.testLoadMorePosts
                    }
                }
            };
            expect(timelineCtrl.testLoadMorePosts).toEqual(undefined);
            timelineCtrl.posts.loadMorePosts = callbackLoadMorePost;
            timelineCtrl.content = content;

            timelineCtrl.content.onscroll();
            expect(timelineCtrl.testLoadMorePosts).toEqual(true);
        });
    });

    describe('Should call delete post function', function() {
        
        it("should not delete post because it isn't in timeline.", function() {
            var post_not_timeline = { 
                title: 'Is not in timeline',
                key: "000",
                state: 'published'
            };

            rootScope.$emit("DELETED_POST_TO_DOWN", post_not_timeline);
            expect(timelineCtrl.posts.size()).toEqual(2);
            expect(timelineCtrl.posts.data).toEqual([new Post(survey), new Post(post)]);
        });

        it('should delete post.', function() {
            expect(timelineCtrl.posts.data).toEqual([new Post(survey), new Post(post)]);
            rootScope.$emit("DELETED_POST_TO_DOWN", post);
            expect(timelineCtrl.posts.size()).toEqual(1);
            expect(timelineCtrl.posts.data).toEqual([new Post(survey)]);

            rootScope.$emit("DELETED_POST_TO_DOWN", survey);
            expect(timelineCtrl.posts.size()).toEqual(0);
            expect(timelineCtrl.posts.data).toEqual([]);
        });
    });

    describe('refreshTimeline()', () => {
        it('should call some functions', () => {
            spyOn(timelineCtrl, 'postsType').and.callThrough();
            spyOn(timelineCtrl, 'toggleRefreshTimelineButton').and.callThrough();
            spyOn(timelineCtrl, '_loadPosts').and.returnValue(q.when());

            timelineCtrl.refreshTimeline();

            expect(timelineCtrl.postsType).toHaveBeenCalled();
            expect(postsFactory.posts.prototype.loadMorePosts).toHaveBeenCalled();
            expect(timelineCtrl.toggleRefreshTimelineButton).toHaveBeenCalled();
        });
    });

    describe('addPost()', () => {
        it('should call addPost and add the post', () => {
            spyOn(timelineCtrl, 'addPost').and.callThrough();
            expect(timelineCtrl.posts.data).toEqual([new Post(survey), new Post(post)]);

            timelineCtrl.addPost(post_toAdd);

            expect(timelineCtrl.addPost).toHaveBeenCalled();
            expect(timelineCtrl.posts.data.length).toEqual(3);
        });
    });

    describe('deletePost()', () => {
        it('should call deletePost and delete the post', () => {
            spyOn(timelineCtrl, 'deletePost').and.callThrough();
            expect(timelineCtrl.posts.data.length).toEqual(2);

            timelineCtrl.deletePost(post);

            expect(timelineCtrl.deletePost).toHaveBeenCalled();
            expect(timelineCtrl.posts.data.length).toEqual(1);
        });
    });

    describe('showRefreshTimelineButton() and toggleRefreshTimelineButton()', () => {
        it('should toggle the value of the flag', () => {
            spyOn(timelineCtrl, 'showRefreshTimelineButton').and.callThrough();
            spyOn(timelineCtrl, 'toggleRefreshTimelineButton').and.callThrough();
            expect(timelineCtrl.showRefreshTimelineButton()).toEqual(false);
            timelineCtrl.toggleRefreshTimelineButton();
            expect(timelineCtrl.showRefreshTimelineButton()).toEqual(true);
            timelineCtrl.toggleRefreshTimelineButton();
            expect(timelineCtrl.showRefreshTimelineButton()).toEqual(false);
        });
    });
}));