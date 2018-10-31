'use strict';

(describe('Test TimelineController', function() {
    beforeEach(module('app'));

    var timelineCtrl, createController, rootScope, scope, notificationService, postsFactory;
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

    var content = {
        'scrollTop': 1,
        'offsetHeight': 3,
        'scrollHeight': 5
    }

    var posts = [survey, post];

    beforeEach(inject(function($controller, AuthService, $rootScope, 
        NotificationService, $q, PostsFactory) {
        rootScope = $rootScope;
        postsFactory = PostsFactory;
        scope = $rootScope.$new();
        notificationService = NotificationService;
        
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

    describe('Should not call delete post function', function() {
        it("should do nothing.", function() {
            console.log(timelineCtrl.posts);
            rootScope.$emit("DELETED_INSTITUTION", {});
            expect(timelineCtrl.posts.size()).toEqual(2);
            expect(timelineCtrl.posts.data).toEqual(posts);
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
            expect(timelineCtrl.posts.size()).toEqual(2);
            expect(timelineCtrl.posts.data).toEqual(posts);
        });

        it('should not delete post because it has activity.', function() {
            timelineCtrl.posts.data = [survey, post];
            expect(timelineCtrl.posts.data[1].comments).toBeUndefined();
            expect(timelineCtrl.posts.data[1].number_of_comments).toBeUndefined();

            rootScope.$emit("DELETED_POST", post_with_activity);
            expect(timelineCtrl.posts.size()).toEqual(2);
            expect(timelineCtrl.posts.data[1]).toEqual(new Post(post_with_activity));
        });

        it('should delete post.', function() {
            expect(timelineCtrl.posts.data).toEqual(posts);
            rootScope.$emit("DELETED_POST", post);
            expect(timelineCtrl.posts.size()).toEqual(1);
            expect(timelineCtrl.posts.data).toEqual([survey]);

            rootScope.$emit("DELETED_POST", post);
            expect(timelineCtrl.posts.size()).toEqual(1);
            expect(timelineCtrl.posts.data).toEqual([survey]);

            rootScope.$emit("DELETED_POST", survey);
            expect(timelineCtrl.posts.size()).toEqual(0);
            expect(timelineCtrl.posts.data).toEqual([]);
        });
    });

    describe('refreshTimeline()', () => {
        it('should call some functions', () => {
            spyOn(timelineCtrl, 'postsType').and.callThrough();
            spyOn(timelineCtrl, 'setRefreshTimelineButton').and.callThrough();
            spyOn(timelineCtrl, '_loadPosts').and.returnValue({});

            timelineCtrl.refreshTimeline();

            expect(timelineCtrl.postsType).toHaveBeenCalled();
            expect(postsFactory.posts.prototype.loadMorePosts).toHaveBeenCalled();
            expect(timelineCtrl.setRefreshTimelineButton).toHaveBeenCalled();
        });
    });
}));