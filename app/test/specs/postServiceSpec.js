'use strict';

(describe('Test PostService', function () {
        var httpBackend, service, $http;
        var POSTS_URI = "/api/posts";

        var user = {name: 'Raoni', key: 12345};

        var institutions = [
            {name: 'Splab',key: '098745', followers: [user], members: [user]},
            {name: 'e-CIS', key: '456879', followers: [user], members: [user]}
        ];

        user.follows = [institutions[0], institutions[1]];
        user.institutions = [institutions[0]];

        var posts = [
            {title: 'teste', text: 'post de teste principal', institution: institutions[0].key},
            {title: 'teste2', text: 'post de teste secundário', institution: institutions[0].key},
            {title: 'teste3', text: 'post de teste auxiliar', institution: institutions[1].key}
        ];

        institutions[0].posts = [posts[0], posts[1]];

        institutions[1].posts= [posts[2]];

        var like = {author: user.key, id: '012320'};

        posts[0].likes = [like];

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
            httpBackend.expect('GET', "/api/user/timeline").respond(posts);
            var result;
            service.get().then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(posts);
        });

        it('Test createPost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI).respond(posts[0]);
            var result;
            service.createPost(posts[0]).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalledWith(POSTS_URI, posts[0]);
            expect(result.data).toEqual(posts[0]);
        });

        it('Test likePost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            service.likePost(posts[0]);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Test dislikePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key + '/likes').respond();
            service.dislikePost(posts[0]);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test deletePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + posts[0].key).respond();
            service.deletePost(posts[0]);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test getLikes in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + posts[0].key + '/likes').respond(posts[0].likes);
            var result;
            service.getLikes(POSTS_URI + '/' + posts[0].key + '/likes').then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual([like]);
        });

        it('Test save in success case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + posts[0].key).respond();
            var newPost = {title: 'test', text: 'post de teste', institution: institutions[0].key};
            var patch = jsonpatch.compare(posts[0], newPost);
            service.save(posts[0], newPost);
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + posts[0].key, patch);
        });

        it('Test save in fail case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + posts[0].key).respond(400, {status: 400, msg: "Operation invalid"});
            var newPost = {title: 'test', institution: institutions[0].key};
            var result;
            var patch = jsonpatch.compare(posts[0], newPost);
            service.save(posts[0], newPost).catch(function(data) {
                result = data;
            });
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + posts[0].key, patch);
            expect(result.status).toEqual(400);
            expect(result.data.msg).toEqual("Operation invalid");
        });


}));