'use strict';

(describe('Test postDetailsController', function() {
    beforeEach(module('app'));

    let postDetailsCtrl, scope, httpBackend, rootScope, mdDialog, postService, mdToast, http,
    commentService, state, posts, rootscope, states;
    var user = {
        name: 'name',
        key: 'asd234jk2l',
        state: 'active'
    };

    var institutions = [
        {name: 'Splab',key: '098745', followers: [user], members: [user], admin: user},
        {name: 'e-CIS', key: '456879', followers: [user], members: [user]}
    ];

    var options = [{
                    'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] 
                }];
    var survey = new Post({
                            title : 'The Survey',
                            type_survey : 'binary',
                            options : options,
                            deadline: new Date('2054-03-14T23:54:00'),
                            number_votes : 0,
                            key: '12345'
                        });
    var sharedSurvey = new Post({
                                    title: 'shared post',
                                    shared_post: survey,
                                    key: '54321'
                                });

    user.current_institution = institutions[0];
    user = new User(user);
    var POSTS_URI = "/api/posts";


    beforeEach(inject(function($controller, $httpBackend, HttpService, $mdDialog, STATES,
            PostService, AuthService, $mdToast, $rootScope, CommentService, $state) {
        scope = $rootScope.$new();
        rootscope = $rootScope;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = HttpService;
        state = $state;
        states = STATES;
        commentService = CommentService;
        commentService.user = user;
        postService.user = user;
        var mainPost = new Post({
                    title: 'main post', author_key: user.key, institution_key: institutions[0].key,
                    key: "123456", comments: "/api/posts/123456/comments",
                    likes: "/api/posts/123456/likes", number_of_likes: 0, number_of_comments: 0, data_comments: {}
        });
        var secondaryPost = new Post({
                                        title: 'secondary post',
                                        author_key: "", 
                                        institution: institutions[0], 
                                        key: "123412356"
                                    });
        var otherPost = new Post({
                                    title: 'other post', 
                                    author: user,
                                    institution: institutions[0],
                                    key: "123454356",
                                    number_of_likes: 1,
                                    number_of_comments: 1
                                });
        
        posts = [mainPost, secondaryPost, otherPost, survey, sharedSurvey];
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);

        AuthService.getCurrentUser = function() {
            return user;
        };

        postDetailsCtrl = $controller('PostDetailsController',{
            scope: scope,
            $rootScope: rootscope,
            $scope: scope
        });

        postDetailsCtrl.isPostPage = true;
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

   describe('deletePost()', function(){
        beforeEach(function() {
            postDetailsCtrl.post = posts[0];
            postDetailsCtrl.posts = [];
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(postService, 'deletePost').and.callThrough();
        });

        it('Should delete the post when it has activity', function() {
            postDetailsCtrl.post.number_of_likes = 1;
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            postDetailsCtrl.deletePost("$event");
            httpBackend.flush();
            expect(postDetailsCtrl.post.state).toBe("deleted");
            expect(postService.deletePost).toHaveBeenCalledWith(postDetailsCtrl.post);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it('Should remove the post when it has no activity', function() {
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            postDetailsCtrl.deletePost("$event");
            httpBackend.flush();
            expect(postDetailsCtrl.post.state).toBe("deleted");
            expect(postService.deletePost).toHaveBeenCalledWith(postDetailsCtrl.post);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('getLikes()', function() {
        it('Should get the likes', function() {
            spyOn(postService, 'getLikes').and.callThrough();
            postDetailsCtrl.post = posts[0];
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.getLikes().then(function() {
                expect(posts[0].number_of_likes).toEqual(0);
                expect(posts[1].number_of_likes).toEqual(undefined);
            });
            httpBackend.flush();
            expect(postService.getLikes).toHaveBeenCalled();
        });
    });

    describe('isAuthorized()', function() {

        var retorno;
        it('Should return true', function() {
           postDetailsCtrl.post = posts[0];
           retorno = postDetailsCtrl.isAuthorized();
           expect(retorno).toEqual(true);
        });

        it('Should return false', function() {
            postDetailsCtrl.post = posts[1];
            retorno = postDetailsCtrl.isAuthorized();
            expect(retorno).toEqual(false);
        });
    });

    describe('timeHasBeenExpired()', function() {

        it('Should return false', function() {
            postDetailsCtrl.post = posts[3];
           expect(postDetailsCtrl.timeHasBeenExpired(postDetailsCtrl.post)).toEqual(false);
        });

        it('Should return true', function() {
            postDetailsCtrl.post = posts[3];
            postDetailsCtrl.post.deadline = new Date('2014-03-14T23:54:00');
            expect(postDetailsCtrl.timeHasBeenExpired(postDetailsCtrl.post)).toEqual(true);
        });
    });

    describe('isSharedSurveyExpired()', function() {

        it('Should return false', function() {
            postDetailsCtrl.post = posts[4];
            postDetailsCtrl.post.shared_post.deadline = new Date('2054-03-14T23:54:00');
           expect(postDetailsCtrl.isSharedSurveyExpired()).toEqual(false);
        });

        it('Should return true', function() {
            postDetailsCtrl.post = posts[4];
            postDetailsCtrl.post.shared_post.deadline = new Date('2014-03-14T23:54:00');
            expect(postDetailsCtrl.isSharedSurveyExpired()).toEqual(true);
        });
    });

    describe('likeOrDislikePost()', function() {
        it('Should like the post', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(postDetailsCtrl, 'isLikedByUser').and.callThrough();
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            spyOn(postService, 'likePost').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            httpBackend.expect('GET', "/api/posts/123456/likes").respond();
            postDetailsCtrl.user.liked_posts = [];
            postDetailsCtrl.likeOrDislikePost(posts[0]).then(function() {
                expect(posts[0].number_of_likes).toEqual(1);
            });
            httpBackend.flush();
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith();
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postService.likePost).toHaveBeenCalledWith(posts[0]);
        });

        it('Should dislike the post', function() {
            postDetailsCtrl.post = posts[0];
            postDetailsCtrl.user.liked_posts = [posts[0].key];
            posts[0].number_of_likes = 1;
            spyOn(postDetailsCtrl, 'isLikedByUser').and.callThrough();
            spyOn(postDetailsCtrl, 'getLikes').and.callThrough();
            spyOn(postService, 'dislikePost').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            postDetailsCtrl.likeOrDislikePost(posts[0]).then(function() {
                expect(posts[0].number_of_likes).toEqual(0);
            });
            httpBackend.flush();
            expect(postDetailsCtrl.isLikedByUser).toHaveBeenCalledWith();
            expect(postDetailsCtrl.getLikes).toHaveBeenCalledWith(posts[0]);
            expect(postService.dislikePost).toHaveBeenCalledWith(posts[0]);
        });
    });

    describe('goToInstitution()', function() {
        it('Should call state.go', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(state, 'go').and.callThrough();

            httpBackend.when('GET', 'institution/institution_page.html').respond(200);

            postDetailsCtrl.goToInstitution(institutions[0].key);

            expect(state.go).toHaveBeenCalledWith(states.INST_TIMELINE, Object({ institutionKey: institutions[0].key }));
        });
    });

    describe('getComments()', function() {
        it('Should get the comments', function() {
            postDetailsCtrl.post = posts[0];
            spyOn(commentService, 'getComments').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/comments').respond();
            postDetailsCtrl.getComments().then(function() {
                expect(posts[0].number_of_comments).toEqual(0);
            });
            httpBackend.flush();
            expect(commentService.getComments).toHaveBeenCalled();
        });
    });

    describe('createComment()', function() {
        it('Should create a comment', function() {
           postDetailsCtrl.post = posts[0];
           postDetailsCtrl.post.data_comments = [];
           spyOn(commentService, 'createComment').and.callThrough();
           httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/comments').respond({
            "text": "comment",
            "id": "123klsdf124"
           });
           postDetailsCtrl.post.data_comments = [];
           postDetailsCtrl.newComment = "teste";
           postDetailsCtrl.createComment().then(function() {
                expect(posts[0].number_of_comments).toEqual(1);
                expect(postDetailsCtrl.newComment).toEqual("");
           });
           httpBackend.flush();
           expect(commentService.createComment).toHaveBeenCalledWith(postDetailsCtrl.post.key, "teste", posts[0].institution_key);
      });

        it('Should not create a comment', function() {
           postDetailsCtrl.post = posts[0];
           spyOn(commentService, 'createComment').and.callThrough();
           postDetailsCtrl.comments = {};
           postDetailsCtrl.newComment = "";
           postDetailsCtrl.createComment();
           expect(commentService.createComment).not.toHaveBeenCalled();
        });
    });

    describe('postToUrl()', function() {
        var post;

        beforeEach(function() {
           post = {
                title: 'Post de Tiago em www.twitter.com',
                text: 'Acessem: www.google.com',
                institutionKey: '54321'
            };
        });

        it('Should not change the original post title', function() {
            postDetailsCtrl.postToURL(post);
            expect(post.title).toEqual("Post de Tiago em www.twitter.com");
        });

        it('Should returns a post with https url in text', function() {
            var newPost = postDetailsCtrl.postToURL(post);
            expect(newPost.text).toEqual("Acessem: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
        });

        it('Should not change the original post text', function() {
            postDetailsCtrl.postToURL(post);
            expect(post.text).toEqual("Acessem: www.google.com");
        });
    });

    describe('showImage()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.photo_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return True when the post has a photo_url', function() {
            expect(postDetailsCtrl.showImage(post)).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            post.state = "deleted";
            expect(postDetailsCtrl.showImage(post)).toBe(false);
        });

        it('should return false when the post does not have a photo_url', function() {
            post.photo_url = null;
            expect(postDetailsCtrl.showImage(post)).toBe(false);
            post.photo_url = "";
            expect(postDetailsCtrl.showImage(post)).toBe(false);
            post.photo_url = undefined;
            expect(postDetailsCtrl.showImage(post)).toBe(false);
        });
    });

    describe('showVideo()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return True when the post has a video_url', function() {
            expect(postDetailsCtrl.showVideo(post)).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            post.state = "deleted";
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
        });

        it('should return false when the post does not have a video_url', function() {
            post.video_url = null;
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
            post.video_url = "";
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
            post.video_url = undefined;
            expect(postDetailsCtrl.showVideo(post)).toBe(false);
        });
    });

    describe('getVideoUrl()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
        });

        it('should return undefined', function() {
            post.video_url = undefined;
            expect(postDetailsCtrl.getVideoUrl(post)).toBe(undefined);
        });

        it('should return the embed Youtube url', function() {
            post.video_url = 'https://www.youtube.com/watch?v=3T3g8rV-5GU';
            expect(postDetailsCtrl.getVideoUrl(post)).toBe('https://www.youtube.com/embed/3T3g8rV-5GU');
        });
    });

    describe('subscribe()', function() {

        var post;

        beforeEach(function() {
            post = posts[0];
            post.subscribers = [user.key];
            postDetailsCtrl.post = post;
        });

        it('should call addSubscriber', function() {
            spyOn(postService, 'addSubscriber').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            postDetailsCtrl.addSubscriber();
            expect(postService.addSubscriber).toHaveBeenCalled();
        });

        it('should call removeSubscriber', function() {
            spyOn(postService, 'removeSubscriber').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            postDetailsCtrl.removeSubscriber();
            expect(postService.removeSubscriber).toHaveBeenCalled();
        });

        it('should return true', function() {
            var result = postDetailsCtrl.isSubscriber();
            expect(result).toBe(true);
        });
    });

    describe('number_of_likes()', function() {

        beforeEach(function() {
            postDetailsCtrl.post = posts[2];
        });

        it('Should return the number of likes if number_of_likes are < 100', function() {
            postDetailsCtrl.post.number_of_likes = 50;
            expect(postDetailsCtrl.number_of_likes()).toEqual(50);
        });

        it('Should return the string "+99" if number_of_likes are > 99', function() {
            postDetailsCtrl.post.number_of_likes = 150;
            expect(postDetailsCtrl.number_of_likes()).toEqual("+99");
        });
    });

    describe('number_of_comments()', function() {
        beforeEach(function() {
            postDetailsCtrl.post = posts[2];
        });

        it('Should return the number of comments if number_of_comments are < 100', function() {
            postDetailsCtrl.post.number_of_comments = 50;
            expect(postDetailsCtrl.number_of_comments()).toEqual(50);
        });

        it('Should return the string "+99" if number_of_comments are > 99', function() {
            postDetailsCtrl.post.number_of_comments = 150;
            expect(postDetailsCtrl.number_of_comments()).toEqual("+99");
        });
    });

    describe('reloadPost()', function () {
        it('should call getPost(postKey)', function () {
            postDetailsCtrl.post = posts[0];
            spyOn(postService, 'getPost').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(posts[0]);
                    }
                };
            });
            postDetailsCtrl.reloadPost();
            expect(postService.getPost).toHaveBeenCalledWith(posts[0].key);
        });
    })

    describe('getButtonColor()', function () {
        it('should return light-green', function () {
            spyOn(postDetailsCtrl, 'isDeleted').and.callThrough();
            postDetailsCtrl.post = posts[2];
            var result = postDetailsCtrl.getButtonColor();
            expect(postDetailsCtrl.isDeleted).toHaveBeenCalled();
            expect(result.background).toEqual('light-green');
            postDetailsCtrl.post.state = 'deleted';
            var result = postDetailsCtrl.getButtonColor(true, true);
            expect(postDetailsCtrl.isDeleted).toHaveBeenCalled();
            expect(result.background).toEqual('light-green');
        });

        it('should return grey', function () {
            spyOn(postDetailsCtrl, 'isDeleted').and.callThrough();
            postDetailsCtrl.post = posts[0];
            postDetailsCtrl.post.state = 'deleted';
            var result = postDetailsCtrl.getButtonColor(true, true);
            expect(postDetailsCtrl.isDeleted).toHaveBeenCalled();
            expect(result.background).toEqual('grey');
        })
    });

    describe('showButtonDelete', function () {
        it('should return true', function () {
            let post = new Post({author_key: user.key, key: 'oakspo-OAKSDPO'});
            postDetailsCtrl.user.permissions = {};
            postDetailsCtrl.post = post;
            let returnedValue;

            var institution_key = institutions[0].key;
            postDetailsCtrl.post.author_key = 'oaksd-oKOKOPDkoa';
            postDetailsCtrl.post.key = 'aoskdopa-KAPODKPOpo';
            postDetailsCtrl.post.institution_key = institution_key;
            postDetailsCtrl.user.permissions.remove_posts = {};
            postDetailsCtrl.user.permissions.remove_posts[institution_key] = true;
            returnedValue = postDetailsCtrl.showButtonDelete();
            expect(returnedValue).toBeTruthy();

            postDetailsCtrl.user.permissions.remove_posts = {};
            postDetailsCtrl.user.permissions.remove_post = {};
            postDetailsCtrl.user.permissions.remove_post[post.key] = true;
            returnedValue = postDetailsCtrl.showButtonDelete();
            expect(returnedValue).toBeTruthy();
        });

        it("should return false", function () {
            let post = new Post({ author_key: user.key, state: 'deleted' });
            postDetailsCtrl.user.permissions = {};
            postDetailsCtrl.post = post;
            let returnedValue = postDetailsCtrl.showButtonDelete();
            expect(returnedValue).toBeFalsy();

            var institution_key = institutions[0].key;
            postDetailsCtrl.post.author_key = 'oaksd-oKOKOPDkoa';
            postDetailsCtrl.post.key = 'aoskdopa-KAPODKPOpo';
            postDetailsCtrl.post.institution_key = institution_key;
            postDetailsCtrl.user.permissions.remove_posts = {};
            postDetailsCtrl.user.permissions.remove_posts[institution_key] = true;
            returnedValue = postDetailsCtrl.showButtonDelete();
            expect(returnedValue).toBeFalsy();

            post = new Post({institution_key: institution_key, author_key: 'oaksdpoka-KOPEkPO'});
            postDetailsCtrl.user.permissions = {}
            returnedValue = postDetailsCtrl.showButtonDelete();
            expect(returnedValue).toBeFalsy();
        });
    });

    describe('showButtonEdit', function () {
        it('should return true', function () {
            let post = new Post({key: 'akposdko-OADKAOP', state:'published', institution_state: "active", number_of_comments: 0, number_of_likes: 0});
            postDetailsCtrl.post = post;
            postDetailsCtrl.user.permissions = {};
            postDetailsCtrl.user.permissions['edit_post'] = {};
            postDetailsCtrl.user.permissions['edit_post'][post.key] = true;

            let returnedValue = postDetailsCtrl.showButtonEdit();
            expect(returnedValue).toBeTruthy();
        });

        it('should return false', function() {
            let post = new Post({key: 'akposdko-OADKAOP', state:'deleted', number_of_comments: 0, number_of_likes: 0});
            postDetailsCtrl.post = post;
            postDetailsCtrl.user.permissions = {};
            postDetailsCtrl.user.permissions['edit_post'] = {};
            postDetailsCtrl.user.permissions['edit_post'][post.key] = true;

            let returnedValue = postDetailsCtrl.showButtonEdit();
            expect(returnedValue).toBeFalsy();

            postDetailsCtrl.post.state = 'published';
            postDetailsCtrl.post.number_of_comments = 2;
            returnedValue = postDetailsCtrl.showButtonEdit();
            expect(returnedValue).toBeFalsy();

            postDetailsCtrl.post.number_of_comments = 0;
            postDetailsCtrl.post.number_of_likes = 2;
            returnedValue = postDetailsCtrl.showButtonEdit();
            expect(returnedValue).toBeFalsy();

            postDetailsCtrl.post.number_of_likes = 0;
            postDetailsCtrl.user.permissions = {};
            returnedValue = postDetailsCtrl.showButtonEdit();
            expect(returnedValue).toBeFalsy();
        });
    });
}));