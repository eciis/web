'use strict';

(describe('Test PostService', function () {
        var httpBackend, service, $http;
        var POSTS_URI = "/api/posts";
        var user = {name: 'Raoni', key: 12345};
        var institutions = [{name: 'Splab',key: '098745', followers: [user], members: [user]},
        {name: 'e-CIS', key: '456879', followers: [user], members: [user]}];
        user.follows = [institutions[0], institutions[1]];
        user.institutions = [institutions[0]];
        var post = {title: 'teste', text: 'post de teste', institution: institutions[0].key};
        var post2 = {title: 'teste2', text: 'post de teste2', institution: institutions[0].key};
        var post3 = {title: 'teste3', text: 'post de teste3', institution: institutions[1].key};
        institutions[0].posts = [post, post2];
        institutions[1].posts= [post3];
        var like = {author: user.key, id: '012320'};
        post.likes = [like];

        function getPosts(){
            var posts = [];
            for(var i = 0; i < user.follows.length; i++){
                for(var j = 0; j < user.follows[i].posts.length; j++){
                    posts.push(user.follows[i].posts[j]);
                }
            }
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
            expect(result.data).toEqual([post, post2, post3]);
        });

        it('Test createPost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI).respond(post);
            var result;
            service.createPost(post).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
            expect($http.post).toHaveBeenCalledWith(POSTS_URI, post);
            expect(result.data).toEqual(post);
        });

        it('Test likePost in success case', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.expect('POST', POSTS_URI + '/' + post.key + '/likes').respond();
            service.likePost(post);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Test dislikePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + post.key + '/likes').respond();
            service.dislikePost(post);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test deletePost in success case', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.expect('DELETE', POSTS_URI + '/' + post.key).respond();
            service.deletePost(post);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test getLikes in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', POSTS_URI + '/' + post.key + '/likes').respond(post.likes);
            var result;
            service.getLikes(POSTS_URI + '/' + post.key + '/likes').then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual([like]);
        });

        it('Test save in success case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + post.key).respond();
            var newPost = {title: 'test', text: 'post de teste', institution: institutions[0].key};
            var patch = jsonpatch.compare(post, newPost);
            service.save(post, newPost);
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + post.key, patch);
        });

        it('Test save in fail case', function() {
            spyOn($http, 'patch').and.callThrough();
            httpBackend.expect('PATCH', POSTS_URI + '/' + post.key).respond(400, {status: 400, msg: "Operation invalid"});
            var newPost = {title: 'test', institution: institutions[0].key};
            var result;
            var patch = jsonpatch.compare(post, newPost);
            service.save(post, newPost).catch(function(data) {
                result = data;
            });
            httpBackend.flush();
            expect($http.patch).toHaveBeenCalled();
            expect($http.patch).toHaveBeenCalledWith(POSTS_URI + '/' + post.key, patch);
            expect(result.status).toEqual(400);
            expect(result.data.msg).toEqual("Operation invalid");
        });


}));