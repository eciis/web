'use strict';

(describe('Test PostService', function () {
        var httpBackend, service, $http;
        var POSTS_URI = "/api/posts";

        var user = {name: 'Raoni', key: 12345};

        var institutions = [{name: 'Splab',key: '098745', followers: [user], members: [user]},
        {name: 'e-CIS', key: '456879', followers: [user], members: [user]}];

        user.follows = [institutions[0], institutions[1]];
        user.institutions = [institutions[0]];

        var mainPostTest = {title: 'teste', text: 'post de teste principal', institution: institutions[0].key};

        var secondaryPostTest = {title: 'teste2', text: 'post de teste secundário', institution: institutions[0].key};

        var helperPostTest = {title: 'teste3', text: 'post de teste auxiliar', institution: institutions[1].key};

        institutions[0].posts = [mainPostTest, secondaryPostTest];

        institutions[1].posts= [helperPostTest];

        var like = {author: user.key, id: '012320'};

        mainPostTest.likes = [like];

        function getPosts(){
            var posts = [];
            _.forEach(user.follows, function(institution) {
                _.forEach(institution.posts, function(post) {
                    posts.push(post);
                });
            });
            return posts;
        }

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, PostService, _$http_) {
            httpBackend = $httpBackend;
            $http = _$http_;
            service = PostService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
        }));

        it('Test get in success case', function() {
            spyOn($http, 'get').and.callThrough();
            var posts = getPosts();
            httpBackend.expect('GET', "/api/user/timeline").respond(posts);
            var result;
            service.get().then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual([mainPostTest, secondaryPostTest, helperPostTest]);
        });

        it('Test createPost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI).respond(mainPostTest);
            var result;
            service.createPost(mainPostTest).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalledWith(POSTS_URI, mainPostTest);
            expect(result.data).toEqual(mainPostTest);
        });

        it('Test likePost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + mainPostTest.key + '/likes').respond();
            service.likePost(mainPostTest);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Test dislikePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + mainPostTest.key + '/likes').respond();
            service.dislikePost(mainPostTest);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test deletePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + mainPostTest.key).respond();
            service.deletePost(mainPostTest);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test getLikes in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + mainPostTest.key + '/likes').respond(mainPostTest.likes);
            var result;
            service.getLikes(POSTS_URI + '/' + mainPostTest.key + '/likes').then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual([like]);
        });

        it('Test save in success case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + mainPostTest.key).respond();
            var newPost = {title: 'test', text: 'post de teste', institution: institutions[0].key};
            var patch = jsonpatch.compare(mainPostTest, newPost);
            service.save(mainPostTest, newPost);
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + mainPostTest.key, patch);
        });

        it('Test save in fail case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + mainPostTest.key).respond(400, {status: 400, msg: "Operation invalid"});
            var newPost = {title: 'test', institution: institutions[0].key};
            var result;
            var patch = jsonpatch.compare(mainPostTest, newPost);
            service.save(mainPostTest, newPost).catch(function(data) {
                result = data;
            });
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + mainPostTest.key, patch);
            expect(result.status).toEqual(400);
            expect(result.data.msg).toEqual("Operation invalid");
        });


}));